import OpenAI from "openai";
import dotenv from "dotenv";
import Companion from "../models/companionModel.js";
import User from "../models/userModel.js";
import sendEmergencyEmail from "../utils/notificationService.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Create or Retrieve Virtual Companion
export const createCompanion = async (req, res) => {
  try {
    const username = "user1"; // Hardcoded for now; later, get from req.body or req.user

    let existingCompanion = await Companion.findOne({ username });

    if (existingCompanion) {
      const companion = await openai.beta.assistants.retrieve(
        existingCompanion.companionId
      );
      return res.json({
        message: `Virtual Companion already exists for ${username}!`,
        companion,
      });
    }

    // Create a new companion
    const virtualCompanion = await openai.beta.assistants.create({
      instructions: `
        You are a Virtual Companion, designed to provide emotional support and track user moods.
        - If the user expresses sadness or distress, offer encouraging and positive support.
        - If the user expresses self-harm thoughts, trigger an emergency alert immediately.
        - Keep responses calm, friendly, and supportive.
      `,
      name: `Virtual Companion - ${username}`,
      tools: [],
      model: "gpt-3.5-turbo",
    });

    // Store companion for this user
    await Companion.create({
      username,
      companionId: virtualCompanion.id,
      conversationHistory: [],
    });

    res.json({
      message: `Virtual Companion successfully created for ${username}!`,
      companion: virtualCompanion,
    });
  } catch (error) {
    console.error("Error creating companion:", error.message);
    res.status(500).json({ error: "Failed to create companion." });
  }
};

// ✅ Interact with Virtual Companion
export const interactWithCompanion = async (req, res) => {
  const { userMessage } = req.body;
  const { username } = req.body;

  try {
    const companionData = await Companion.findOne({ username });

    if (!companionData) {
      return res
        .status(400)
        .json({ error: `Companion for ${username} not created yet.` });
    }

    const userData = await User.findOne({ username });

    // ✅ Emergency contact details (in case of self-harm detection)
    const emergencyContactEmail = userData?.emergencyContactEmail || null;
    const emergencyContactName = userData?.emergencyContactName || null;

    // ✅ Construct the conversation history for OpenAI
    const conversationHistory = companionData.conversationHistory || [];

    const messages = [
      {
        role: "system",
        content: `
          You are a Virtual Companion providing emotional support.
          - If the user expresses sadness or distress, offer encouraging and positive support.
          - If the user expresses self-harm thoughts, trigger an emergency alert immediately.
          - Keep responses calm, friendly, and supportive.
        `,
      },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // ✅ Generate a response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const assistantReply = response.choices[0].message.content;

    // ✅ Detect Self-Harm Thoughts
    if (
      /kill myself|harm myself|hurt myself|end my life|suicide/i.test(
        userMessage
      )
    ) {
      console.log("⚠️ Self-harm detected!");

      if (emergencyContactEmail) {
        sendEmergencyEmail(
          emergencyContactEmail,
          "Emergency Alert - Self-Harm Detected",
          `⚠️ The user has expressed thoughts of self-harm. Please contact them immediately.`
        );
      }

      return res.json({
        reply:
          "I'm really concerned about what you just said. Please reach out to someone you trust or a professional for help.",
      });
    }

    // ✅ Cheer Up User if They are Sad
    if (/sad|depressed|lonely|hopeless/i.test(userMessage)) {
      return res.json({
        reply: `${assistantReply}\n\n🌸 I'm here for you. You're not alone. ❤️`,
      });
    }

    // ✅ Store message history in MongoDB
    companionData.conversationHistory.push({
      role: "user",
      content: userMessage,
    });
    companionData.conversationHistory.push({
      role: "assistant",
      content: assistantReply,
    });

    await companionData.save();

    res.json({ reply: assistantReply });
  } catch (error) {
    console.error("Error interacting with companion:", error.message);
    res.status(500).json({ error: "Failed to interact with companion." });
  }
};

// ✅ Get full conversation history
export const getCompanionHistory = async (req, res) => {
  const { username } = req.query;

  try {
    const companionData = await Companion.findOne({ username });
    if (!companionData) {
      return res
        .status(400)
        .json({ error: `No conversation history found for ${username}.` });
    }

    res
      .status(200)
      .json({ conversationHistory: companionData.conversationHistory });
  } catch (error) {
    console.error("Error fetching conversation history:", error.message);
    res.status(500).json({ error: "Failed to retrieve conversation history." });
  }
};

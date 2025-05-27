import OpenAi from "openai";
import dotenv from "dotenv";
import Assistant from "../models/assistantModel.js";
import User from "../models/userModel.js";

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or Retrieve Assistant
export const createAssistant = async (req, res) => {
  try {
    const username = "user1"; // Hardcoded for now; later, get it from req.body or req.user

    let existingAssistant = await Assistant.findOne({ username });

    if (existingAssistant) {
      const assistant = await openai.beta.assistants.retrieve(
        existingAssistant.assistantId
      );
      return res.json({
        message: `Cooking assistant already exists for ${username}!`,
        assistant,
      });
    }

    // Create a new assistant for this user
    const dementiaCookingAssistant = await openai.beta.assistants.create({
      instructions: `
            You are a supportive assistant for individuals with dementia, specifically focused on guiding them during cooking.
            Provide step-by-step instructions in simple language and ensure safety reminders like turning off the stove or avoiding sharp objects.
            Be patient, and use simple and encouraging language.
          `,
      name: `Dementia Cooking Assistant - ${username}`,
      tools: [],
      model: "gpt-3.5-turbo",
    });

    // Store assistant for this user
    await Assistant.create({
      username,
      assistantId: dementiaCookingAssistant.id,
      conversationHistory: [], // Start with an empty conversation history
    });

    res.json({
      message: `Cooking assistant successfully created for ${username}!`,
      assistant: dementiaCookingAssistant,
    });
  } catch (error) {
    console.error("Error creating assistant:", error.message);
    res.status(500).json({ error: "Failed to create assistant." });
  }
};

// Interact with Assistant
export const interactWithAssistant = async (req, res) => {
  const { userMessage } = req.body;
  const { username } = req.body;

  try {
    const assistantData = await Assistant.findOne({ username });

    if (!assistantData) {
      return res
        .status(400)
        .json({ error: `Assistant for ${username} not created yet.` });
    }

    // Retrieve health considerations related to the user
    const userData = await User.findOne({ username });
    const healthConditions =
      userData?.healthConditions || "No specific health considerations.";

    console.log(`Health Conditions for ${username}: ${healthConditions}`);

    // Retrieve the stored conversation history
    const conversationHistory = assistantData.conversationHistory || [];

    // Construct the conversation history for OpenAI
    const messages = [
      {
        role: "system",
        content: `
          You are a dementia-friendly cooking assistant.
          The user has the following health conditions: ${healthConditions}.
          You MUST consider these health conditions when suggesting ingredients and recipes.
          Avoid suggesting ingredients that conflict with these health conditions.
          `,
      },
      ...conversationHistory, // Append past messages
      { role: "user", content: userMessage }, // Append new user input
    ];

    console.log("=== Full Prompt Sent to OpenAI ===");
    console.log(JSON.stringify(messages, null, 2));
    console.log("===================================");

    // Generate a response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const assistantReply = response.choices[0].message.content;

    // Update MongoDB: Append user message & assistant reply to conversation history
    assistantData.conversationHistory.push({
      role: "user",
      content: userMessage,
    });
    assistantData.conversationHistory.push({
      role: "assistant",
      content: assistantReply,
    });
    await assistantData.save();

    res.json({ reply: assistantReply });
  } catch (error) {
    console.error("Error interacting with assistant:", error.message);
    res.status(500).json({ error: "Failed to interact with assistant." });
  }
};

// Get full conversation history
export const getConversationHistory = async (req, res) => {
  const { username } = req.query;

  try {
    const assistantData = await Assistant.findOne({ username });
    if (!assistantData) {
      return res
        .status(400)
        .json({ error: `No conversation history found for ${username}.` });
    }

    res
      .status(200)
      .json({ conversationHistory: assistantData.conversationHistory });
  } catch (error) {
    console.error("Error fetching conversation history:", error.message);
    res.status(500).json({ error: "Failed to retrieve conversation history." });
  }
};

import OpenAi from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

let dementiaCookingAssistant = null;

// creating the assistant

export const createAssistant = async (req, res) => {
  try {
    dementiaCookingAssistant = await openai.beta.assistants.create({
      instructions: `
            You are a supportive assistant for individuals with dementia, specifically focused on guiding them during cooking.
            Provide step-by-step instructions in simple language and ensure safety reminders like turning off the stove or avoiding sharp objects.
            Be patient, and use simple and encouraging language.
          `,
      name: "Dementia Cooking Assistant",
      tools: [],
      model: "gpt-3.5-turbo",
    });

    res.json({
      message: "cooking assistant successfully created!",
      assistant: dementiaCookingAssistant,
    });
  } catch (error) {
    console.error("Error creating assistant:", error.message);
    res.status(500).json({ error: "Failed to create assistant." });
  }
};

// to interact with patient

export const interactWithAssistant = async (req, res) => {
  const { userMessage } = req.body;

  if (!dementiaCookingAssistant) {
    return res.status(400).json({ error: "Assistant not created yet." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: dementiaCookingAssistant.model,
      messages: [
        { role: "system", content: dementiaCookingAssistant.instructions },
        { role: "user", content: userMessage },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error interacting with assistant:", error.message);
    res.status(500).json({ error: "Failed to interact with assistant." });
  }
};

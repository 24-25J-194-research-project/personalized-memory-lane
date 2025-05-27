import mongoose from "mongoose";

const AssistantSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Each user has a unique assistant
  assistantId: { type: String, required: true },
  conversationHistory: [
    {
      role: { type: String, enum: ["system", "user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Assistant = mongoose.model("Assistant", AssistantSchema);
export default Assistant;

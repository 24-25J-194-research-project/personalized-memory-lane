import mongoose from "mongoose";

const CompanionSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  companionId: { type: String, required: true },
  conversationHistory: [
    {
      role: {
        type: String,
        enum: ["system", "user", "assistant"],
        required: true,
      },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Companion = mongoose.model("Companion", CompanionSchema);
export default Companion;

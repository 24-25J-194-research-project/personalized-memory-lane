import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  step: { type: String, required: true },
  time: { type: String, default: null }, // ✅ Added time field
});

const recipeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  ingredients: [String],
  steps: [stepSchema],
});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;

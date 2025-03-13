import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  healthConditions: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);
export default User;

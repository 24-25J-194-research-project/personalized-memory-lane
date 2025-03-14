import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  healthConditions: { type: String, default: "" },
  emergencyContactName: { type: String },
  emergencyContactEmail: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;

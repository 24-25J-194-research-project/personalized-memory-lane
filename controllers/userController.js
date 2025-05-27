import User from "../models/userModel.js";

// Update Health Conditions
export const updateHealthConditions = async (req, res) => {
  const {
    username,
    healthConditions,
    emergencyContactName,
    emergencyContactEmail,
    name,
    location,
  } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { username },
      {
        healthConditions,
        emergencyContactName,
        emergencyContactEmail,
        name,
        location,
      },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Health conditions updated", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update health conditions" });
  }
};

// Get Health Conditions
export const getHealthConditions = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      healthConditions: user.healthConditions,
      emergencyContactName: user.emergencyContactName,
      emergencyContactEmail: user.emergencyContactEmail,
      name: user.name,
      location: user.location,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get health conditions" });
  }
};

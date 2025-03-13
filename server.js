import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose"
import cookingAssistantRoutes from "./routes/cookingAssistant.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// mongodb connection 
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB connection error:", err));

//adding routes
app.use("/cooking-assistant", cookingAssistantRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Cooking Assistant up and running on port ${PORT} 🧑‍🍳` ));
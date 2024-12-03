import express from "express";
import {
  createAssistant,
  interactWithAssistant,
} from "../controllers/cookingAssistantController.js";

const router = express.Router();

//create the assistant
router.post("/create", createAssistant);

//route to interact
router.post("/interact-cooking", interactWithAssistant);

export default router;

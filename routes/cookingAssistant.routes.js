import express from "express";
import {
  createAssistant,
  interactWithAssistant,
  getConversationHistory,
} from "../controllers/cookingAssistantController.js";
import {
  updateHealthConditions,
  getHealthConditions,
} from "../controllers/userController.js";
import {
  createRecipe,
  getRecipes,
  deleteRecipe,
} from "../controllers/recipieAssistantController.js";
import {
  createCompanion,
  interactWithCompanion,
  getCompanionHistory,
} from "../controllers/virtualCompanionController.js";

const router = express.Router();

//create the assistant
router.post("/create", createAssistant);
router.post("/interact-cooking", interactWithAssistant);
router.get("/get-conversation-history", getConversationHistory);

router.post("/user/update-health-conditions", updateHealthConditions);
router.get("/user/health-conditions", getHealthConditions);

router.post("/create-recipe", createRecipe);
router.get("/get-recipes", getRecipes);
router.delete("/delete-recipe/:id", deleteRecipe);

router.post("/create-companion", createCompanion);
router.post("/interact-companion", interactWithCompanion);
router.get("/companion-history", getCompanionHistory);

export default router;

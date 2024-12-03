import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookingAssistantRoutes from "./routes/cookingAssistant.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

//adding routes
app.use("/cooking-assistant", cookingAssistantRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`cooking assistant is up and running on port ${PORT}`);
});

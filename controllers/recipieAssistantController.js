import OpenAi from "openai";
import dotenv from "dotenv";
import Recipe from "../models/recipieModel.js";

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createRecipe = async (req, res) => {
  const { username, recipeName } = req.body;

  try {
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `You are a recipe assistant. Generate ingredients and steps for the following recipe: ${recipeName}.
    //                 Identify any time-related steps and include them as "time" in the JSON.
    //                 Return the response in JSON format:
    //                 {
    //                   "ingredients": ["ingredient 1", "ingredient 2", ...],
    //                   "steps": [
    //                     {
    //                       "step": "step 1",
    //                       "time": "10 mins" // If applicable, otherwise null
    //                     },
    //                     {
    //                       "step": "step 2",
    //                       "time": null
    //                     }
    //                   ]
    //                 }`,
    //     },
    //   ],
    //   temperature: 0.7,
    // });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a recipe assistant. Generate ingredients and steps for the following recipe: ${recipeName}. 
                    Identify any time-related steps and include them as "time" in the JSON.
                    Also create an "image_prompt" for each step that can be used to generate an image.
                    Return the response in JSON format:
                    {
                      "ingredients": ["ingredient 1", "ingredient 2", ...],
                      "steps": [
                        {
                          "step": "step 1",
                          "time": "10 mins", // If applicable, otherwise null
                          "image_prompt": "chopped onions in a pan"
                        },
                        {
                          "step": "step 2",
                          "time": null,
                          "image_prompt": "boiling water"
                        }
                      ]
                    }`,
        },
      ],
      temperature: 0.7,
    });

    // ✅ Parse the JSON response from OpenAI
    const result = JSON.parse(response.choices[0].message.content);

    // ✅ Generate images using DALL-E
    for (const step of result.steps) {
      if (step.image_prompt) {
        const imageResponse = await openai.images.generate({
          model: "dall-e-2",
          prompt: step.image_prompt,
          n: 1,
          size: "512x512",
        });
        step.image = imageResponse.data[0].url;
      }
    }

    // ✅ Save to MongoDB
    const newRecipe = await Recipe.create({
      username,
      name: recipeName,
      ingredients: result.ingredients,
      steps: result.steps,
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error.message);
    res.status(500).json({ error: "Failed to create recipe" });
  }
};

export const getRecipes = async (req, res) => {
  const { username } = req.query;

  try {
    const recipes = await Recipe.find({ username }).select("-__v");
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.status(500).json({ error: "Failed to get recipes" });
  }
};

// Delete Recipe
export const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    await Recipe.findByIdAndDelete(id);
    res.status(200).json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("Error deleting recipe:", error.message);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
};

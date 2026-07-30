import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

// Helper function to lazy-load instances when needed
export const getModel = async (agent) => {
  // Ensure API Key exists before attempting call
  if (agent === "coding" && !process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is missing from environment variables.",
    );
  }

  switch (agent) {
    case "chat":
      return new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
      });
    case "search":
      return new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
      });

    case "coding":
      return new ChatOpenRouter({
        model: "deepseek/deepseek-chat",
        temperature: 0,
        maxTokens: 8192,
        apiKey: process.env.OPENROUTER_API_KEY,
        openrouterApiKey: process.env.OPENROUTER_API_KEY,
      });

    default:
      return new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
      });
  }
};

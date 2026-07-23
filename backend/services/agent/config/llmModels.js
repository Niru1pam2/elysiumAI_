import dotenv from "dotenv";
dotenv.config(); // Ensures environment variables are loaded immediately

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// 1. Instantiating models after dotenv is loaded
const groq = new ChatGroq({
  model: "llama-3.3-70b-versatile", // Use a valid Groq model
  apiKey: process.env.GROQ_API_KEY,
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash", // Use a valid Gemini model
  apiKey: process.env.GEMINI_API_KEY,
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return gemini;
    default:
      return groq;
  }
};

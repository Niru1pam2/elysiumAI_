import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import fs from "fs";
import { updateCredits } from "../utils/deductCredits.js";

export const imageAnalyzer = async (state) => {
  try {
    const llm = await getModel("imageAnalyzer");

    // 1. Read file synchronously into a buffer
    const imageBuffer = fs.readFileSync(state.file.path);
    const base64image = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(
        `You are elysiumAI image analyzer Agent.

Rules:
- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
`,
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "Analyze this image.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);

    // 2. Deduct credits using the clean forward headers
    await updateCredits(state.userId, "vision", state.headers);

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.error("Image Analyzer Error:", error);
    return {
      ...state,
      aiResponse: "Failed to analyze image.",
    };
  } finally {
    // 3. Safe cleanup check
    if (state.file?.path && fs.existsSync(state.file.path)) {
      fs.unlinkSync(state.file.path);
    }
  }
};

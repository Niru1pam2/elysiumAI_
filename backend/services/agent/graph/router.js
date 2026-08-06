import { getModel } from "../config/llmModels.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }

  console.log("FILE in state", state.file);

  if (state.file?.mimetype?.startsWith("application/pdf")) {
    return {
      ...state,
      agent: "pdfRag",
    };
  }

  if (state.file?.mimetype?.startsWith("image/")) {
    return {
      ...state,
      agent: "imageAnalyzer",
    };
  }

  const llm = await getModel("router");

  // 1. Ensure prompt is a plain string
  const userQuery =
    typeof state.prompt === "string"
      ? state.prompt
      : state.prompt?.content || JSON.stringify(state.prompt || "");

  const promptText = `
    You are an agent router.

    Available agents:
    - chat
    - search
    - coding
    - pdf
    - ppt
    - vision

    Rules:
    chat: General conversation, explanations, learning, questions.
    search: Current events, latest information, news, recent developments, internet lookup.
    coding: Generate code, debug code, build projects, architecture, API design.
    pdf: Questions about generate PDFs or document context.
    ppt: Questions about generate ppts or ppt context.
    vision: Generate image, create image.

    Return ONLY one word:
    chat
    search
    coding
    pdf
    ppt
    vision

    User Query:
    ${userQuery}
  `;

  // 2. Pass the plain string to llm.invoke()
  const response = await llm.invoke(promptText);

  const agentChoice = (response.content || response)
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, ""); // Removes trailing dots, quotes, markdown

  console.log("AGENT CHOICE", agentChoice);

  return {
    ...state,
    agent: agentChoice,
  };
};

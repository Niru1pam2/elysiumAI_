import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";
import { updateCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const chatAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "chat");
    const llm = await getModel("chat");
    const history = await getMemory(state.conversationId, state.headers);

    const searchContext = state.searchResults
      ? `
    Web Search Results:
    
    ${JSON.stringify(state.searchResults)}
    
    Answer the user using only the above search results.
    `
      : "";

    const systemPrompt = `You are elysiumAI, an intelligent AI assistant.
    
    ${searchContext}
    
    If searchContext exists:
    
    - Use search results to answer.
    - Do not mention internal tools.
    
    Rules:
    
    - For simple questions, greetings and short queries, respond naturally in plain text.
    - For technical, educational, coding, or detailed topics, use clean markdown.
    
    Formatting:
    
    - Use # for titles and ## for sections.
    - Leave a blank line after headings.
    - Use bullet points for lists.
    - Use numbered lists for steps.
    - Use fenced code blocks with language tags for code.
    - Keep paragraphs short and readable.
    - Never write headings and content on the same line.
    - Never generate large walls of text.
    `;

    // 1. Initialize message array with system prompt
    const messages = [new SystemMessage(systemPrompt)];

    // 2. Push past conversation history
    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role === "user") {
          messages.push(new HumanMessage(msg.content));
        } else {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // 3. Push current user message from state
    messages.push(new HumanMessage(state.prompt));

    // 4. Pass the complete history to the model
    const response = await llm.invoke(messages);

    await updateCredits(state.userId, "chat", state.headers);
    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    if (error.status == 429) {
      return {
        ...state,
        aiResponse: error?.data.message,
      };
    }
    return {
      ...state,
      aiResponse: "Failed to generate response.",
    };
  }
};

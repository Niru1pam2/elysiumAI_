import { checkAgentLimit } from "../config/agentLimit.js";
import { searchTool } from "../config/tavily.js";
import { updateCredits } from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "search");

    const results = await searchTool.invoke({
      query: state.prompt,
    });

    await updateCredits(state.userId, "search", state.headers);

    return {
      ...state,
      searchResults: results,
      images: results.images,
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
      searchResults: [],
      images: [],
    };
  }
};

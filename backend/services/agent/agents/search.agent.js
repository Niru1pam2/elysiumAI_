import { searchTool } from "../config/tavily.js";
import { updateCredits } from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
  try {
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
    return {
      ...state,
      searchResults: [],
      images: [],
    };
  }
};

import api from "../../utils/axios";

export const logout = async () => {
  try {
    const { data } = await api.post("/api/auth/logout");
    return data;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error; // Re-throw so caller knows request failed if needed
  }
};

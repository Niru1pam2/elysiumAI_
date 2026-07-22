import api from "../../utils/axios";

const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export default getCurrentUser;

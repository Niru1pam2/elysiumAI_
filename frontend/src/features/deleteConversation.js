import api from "../../utils/axios";

export const deleteConversation = async (conversationId) => {
  try {
    const { data } = await api.delete(`/api/chat/delete/${conversationId}`);

    return data;
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return null;
  }
};

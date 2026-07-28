// backend/services/agent/utils/getMessages.js
import axios from "axios";

export const getMessages = async (conversationId, headers = {}) => {
  if (!conversationId) return [];

  try {
    const response = await axios.get(
      `${process.env.CHAT_SERVICE_URL}/get-messages/${conversationId}`,
      {
        headers: {
          "x-user-id": headers["x-user-id"] || headers?.["X-User-Id"] || "",
          cookie: headers.cookie || "",
          authorization: headers.authorization || "",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch messages from Chat Service:",
      error?.message,
    );
    return [];
  }
};

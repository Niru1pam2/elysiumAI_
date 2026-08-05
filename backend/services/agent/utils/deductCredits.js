import axios from "axios";

export const updateCredits = async (userId, agent, headers = {}) => {
  try {
    const cookie = headers["cookie"] || headers["Cookie"];
    const xUserId = headers["x-user-id"] || headers["X-User-Id"] || userId;
    const { data } = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/update-credits`,
      { userId, agent },
      {
        headers: {
          "Content-Type": "application/json",
          ...(cookie && { cookie }),
          ...(xUserId && { "x-user-id": xUserId }),
        },
      },
    );

    return data;
  } catch (error) {
    console.error("Update credits error:", error);
    return nil;
  }
};

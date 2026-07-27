export const getMessages = async (conversationId) => {
  try {
    const { data } = await axios.get(
      `${process.env.CHAT_SERVICE_URL}/get-messages/${conversationId}`,
      {
        headers: {
          "x-user-id": req.headers["x-user-id"] || "",
          cookie: req.headers.cookie || "",
          authorization: req.headers.authorization || "",
        },
      },
    );

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

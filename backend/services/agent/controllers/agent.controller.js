import axios from "axios";
import graph from "../graph/graph.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;
    await axios.post(
      `${process.env.CHAT_SERVICE_URL}/save-message`,
      {
        conversationId,
        role: "user",
        content: prompt,
      },
      {
        headers: {
          "x-user-id": req.headers["x-user-id"] || "",
          cookie: req.headers.cookie || "",
          authorization: req.headers.authorization || "",
        },
      },
    );

    const result = await graph.invoke({
      prompt,
      conversationId,
    });

    const response = result.aiResponse;

    await axios.post(
      `${process.env.CHAT_SERVICE_URL}/save-message`,
      {
        conversationId,
        role: "assistant",
        content: response,
      },
      {
        headers: {
          "x-user-id": req.headers["x-user-id"] || "",
          cookie: req.headers.cookie || "",
          authorization: req.headers.authorization || "",
        },
      },
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: `agent error ${error}` });
  }
};

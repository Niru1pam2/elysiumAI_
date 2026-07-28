import axios from "axios";
import graph from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;

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
      headers: req.headers,
      agent,
    });

    const response = result.aiResponse;
    await addMessage(conversationId, "user", prompt);

    await addMessage(conversationId, "assistant", response);

    await axios.post(
      `${process.env.CHAT_SERVICE_URL}/save-message`,
      {
        conversationId,
        role: "assistant",
        content: response,
        images: result.images,
      },
      {
        headers: {
          "x-user-id": req.headers["x-user-id"] || "",
          cookie: req.headers.cookie || "",
          authorization: req.headers.authorization || "",
        },
      },
    );

    return res.status(200).json({
      answer: response,
      images: result.images,
    });
  } catch (error) {
    return res.status(500).json({ message: `agent error ${error}` });
  }
};

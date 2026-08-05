import axios from "axios";
import graph from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

// Helper function to build clean headers for internal service calls
const getForwardHeaders = (req) => {
  const headers = {};

  const userId = req.headers["x-user-id"] || req.headers["X-User-Id"];
  const cookie = req.headers["cookie"] || req.headers["Cookie"];
  const auth = req.headers["authorization"] || req.headers["Authorization"];

  if (userId) headers["x-user-id"] = userId;
  if (cookie) headers["cookie"] = cookie;
  if (auth) headers["authorization"] = auth;

  return headers;
};

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const forwardHeaders = getForwardHeaders(req);

    const userId = forwardHeaders["x-user-id"];

    // 1. Save user message to Chat Service
    await axios.post(
      `${process.env.CHAT_SERVICE_URL}/save-message`,
      {
        conversationId,
        role: "user",
        content: prompt,
      },
      {
        headers: forwardHeaders,
        withCredentials: true,
      },
    );

    // 2. Invoke Graph
    const result = await graph.invoke({
      prompt,
      conversationId,
      headers: forwardHeaders,
      agent,
      userId,
    });

    const response = result.aiResponse;

    // 3. Save to local memory
    await addMessage(conversationId, "user", prompt);
    await addMessage(conversationId, "assistant", response);

    // 4. Save assistant message to Chat Service
    await axios.post(
      `${process.env.CHAT_SERVICE_URL}/save-message`,
      {
        conversationId,
        role: "assistant",
        content: response,
        images: result?.images || [],
        artifacts: result?.artifacts || [],
      },
      {
        headers: forwardHeaders,
        withCredentials: true,
      },
    );

    return res.status(200).json({
      answer: response,
      images: result.images || [],
      artifacts: result.artifacts || [],
    });
  } catch (error) {
    console.error(
      "Agent error details:",
      error?.response?.data || error?.message,
    );
    return res.status(error?.response?.status || 500).json({
      message: `Agent error: ${error?.response?.data?.message || error.message}`,
    });
  }
};

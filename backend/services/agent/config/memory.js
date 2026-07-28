// backend/services/agent/config/memory.js
import redis from "../../../shared/redis/redis.js";
import { getMessages } from "../utils/getMessages.js";

export const getMemory = async (conversationId, headers = {}) => {
  if (!conversationId) return [];

  const key = `messages-${conversationId}`;
  const cached = await redis.get(key);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Failed to parse cached memory:", e);
    }
  }

  // Pass headers to getMessages
  const messages = await getMessages(conversationId, headers);
  const safeMessages = Array.isArray(messages) ? messages : [];

  if (safeMessages.length > 0) {
    await redis.set(key, JSON.stringify(safeMessages), "EX", 24 * 60 * 60);
  }

  return safeMessages;
};

export const addMessage = async (
  conversationId,
  role,
  content,
  headers = {},
) => {
  if (!conversationId) return;

  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);

  let messages = [];

  if (rawMessages) {
    try {
      const parsed = JSON.parse(rawMessages);
      if (Array.isArray(parsed)) messages = parsed;
    } catch (e) {
      messages = [];
    }
  }

  if (messages.length === 0) {
    // Pass headers here as well
    const dbMessages = await getMessages(conversationId, headers);
    if (Array.isArray(dbMessages)) messages = dbMessages;
  }

  messages.push({ role, content });

  if (messages.length > 20) {
    messages = messages.slice(-20);
  }

  await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
};

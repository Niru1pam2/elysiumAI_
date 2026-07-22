import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// Helper to validate and extract user ID from gateway header
const getUserIdFromHeader = (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: Missing user context" });
    return null;
  }
  return userId;
};

export const createConversation = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req, res);
    if (!userId) return;

    const conversation = await Conversation.create({ userId });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ error: "Failed to create conversation" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req, res);
    if (!userId) return;

    const conversations = await Conversation.find({ userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req, res);
    if (!userId) return;

    const { conversationId, role, content } = req.body;

    if (!conversationId || !role || !content) {
      return res.status(400).json({ error: "Missing required message fields" });
    }

    // Security Check: Verify the conversation belongs to this user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ error: "Conversation not found or access denied" });
    }

    const message = await Message.create({
      conversationId,
      content,
      role,
    });

    // Touch conversation's updatedAt timestamp so it bumps to top of recent chat lists
    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error("Save message error:", error);
    return res.status(500).json({ error: "Failed to save message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req, res);
    if (!userId) return;

    const { conversationId } = req.params;

    // Security Check: Ensure user owns the conversation before fetching messages
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ error: "Conversation not found or access denied" });
    }

    // Sort ascending (1) so chat messages render in chronological order
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req, res);
    if (!userId) return;

    const { id, title } = req.body;

    // Security Check + Fixed Query: Ensure ownership and return updated doc
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { title },
      { new: true }, // Returns the updated document instead of the old one
    );

    if (!conversation) {
      return res
        .status(404)
        .json({ error: "Conversation not found or access denied" });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Update conversation error:", error);
    return res.status(500).json({ error: "Failed to update conversation" });
  }
};

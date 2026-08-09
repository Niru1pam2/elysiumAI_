import express from "express";
import {
  createConversation,
  deleteConversation,
  getConversations,
  getMessages,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Fixed: POST for creation
router.post("/create-conversation", createConversation);

// Correct: GET for fetching list
router.get("/get-conversations", getConversations);

// Fixed: Typo in 'message'
router.post("/save-message", saveMessage);

// Fixed: GET for fetching messages by param
router.get("/get-messages/:conversationId", getMessages);

router.delete("/delete/:conversationId", deleteConversation);

// Fixed: PATCH or PUT for updating
router.patch("/update-conversation", updateConversation);

export default router;

import express from "express";
import {
  loginController,
  logoutController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/logout", logoutController);

export default router;

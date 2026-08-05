import express from "express";
import {
  loginController,
  logoutController,
  updateUserPayment,
  deductCredits,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/update-plan", updateUserPayment);
router.post("/update-credits", deductCredits);

export default router;

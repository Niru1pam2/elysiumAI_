import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in ms
};

export const loginController = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid Firebase ID token." });
    }

    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || "",
        avatar: decoded.picture || "",
      });
    }

    const sessionId = crypto.randomUUID();
    const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

    // Store user data in Redis
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      SESSION_TTL_SECONDS,
    );

    // Set HTTP-only Cookie
    res.cookie("session", sessionId, COOKIE_OPTIONS);

    return res.status(200).json(user);
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutController = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    console.log("cookies", req.cookies);

    if (sessionId) {
      await redis.del(`session:${sessionId}`);
      // Pass the matching cookie options when clearing
      res.clearCookie("session");
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Set plan expiration to 30 days from now

    await user.save();

    const sessionId = req.cookies?.session;
    if (sessionId) {
      // Update the session data in Redis
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpiresAt: user.planExpiresAt,
        }),
        "EX",
        60 * 60 * 24 * 7, // 7 days
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update user payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      vision: 10,
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cost = COST[agent] || 0;

    if (user.credits < cost) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    user.credits -= cost;
    await user.save();

    const sessionId = req.cookies?.session;
    if (sessionId) {
      // Update the session data in Redis
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpiresAt: user.planExpiresAt,
        }),
        "EX",
        60 * 60 * 24 * 7, // 7 days
      );
    }

    return res
      .status(200)
      .json({ success: true, remainingCredits: user.credits });
  } catch (error) {
    console.error("Deduct credits error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import getCurrentUser from "./controllers/user.controller.js";
import proxyWithHeader from "./utils/proxyWithHeader.js";
import morgan from "morgan";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));

// Clean frontend URL (removes any trailing slash)
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS requests before proxying

app.use(cookieParser());

// Root Health Check
app.get("/", (req, res) => {
  res.send("Hello from the gateway!: v15");
});

// Auth Verification Route
app.get("/api/me", protect, getCurrentUser);

// Microservice Proxy Routes
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE_URL));
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE_URL));
app.use(
  "/api/billing",
  protect,
  proxyWithHeader(process.env.BILLING_SERVICE_URL),
);

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});

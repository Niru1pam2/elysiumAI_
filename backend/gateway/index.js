import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import getCurrentUser from "./controllers/user.controller.js";
import proxyWithHeader from "./utils/proxyWithHeader.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE_URL));
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE_URL));

app.get("/", (req, res) => {
  res.send("Hello from the gateway!");
});

app.get("/api/me", protect, getCurrentUser);

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";

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
app.use("/auth", proxy(process.env.AUTH_SERVICE_URL));

app.get("/", (req, res) => {
  res.send("Hello from the gateway!");
});

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});

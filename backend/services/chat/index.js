import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/chat.routes.js";

dotenv.config();

const PORT = process.env.PORT || 8002;

const app = express();

app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.send("Hello from the chat service!");
});

app.listen(PORT, () => {
  console.log(`Chat service is running on port ${PORT}`);
  connectDB();
});

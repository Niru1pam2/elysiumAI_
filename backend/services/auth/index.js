import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.send("Hello from the auth service!");
});

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  connectDB();
});

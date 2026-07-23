import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDB } from "./config/db.js";
import router from "./routes/agent.route.js";

const PORT = process.env.PORT || 8002;

const app = express();

app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.send("Hello from the agent service!");
});

app.listen(PORT, () => {
  console.log(`Agent service is running on port ${PORT}`);
  connectDB();
});

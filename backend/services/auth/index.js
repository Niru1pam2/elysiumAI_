import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/auth.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/", router);
const PORT = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.send("Hello from the auth service!");
});

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  connectDB();
});

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import router from "./routes/billing.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/", router);
app.use(cookieParser());
const PORT = process.env.PORT || 8004;

app.get("/", (req, res) => {
  res.send("Hello from the billing service!");
});

app.listen(PORT, () => {
  console.log(`Billing service is running on port ${PORT}`);
  connectDB();
});

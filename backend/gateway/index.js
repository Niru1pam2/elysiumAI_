import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use("/auth", proxy(process.env.AUTH_SERVICE_URL));

app.get("/", (req, res) => {
  res.send("Hello from the gateway!");
});

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import router from "./src/routes/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rate limit: 25 requests per minute per IP, block if exceeded
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25, // 25 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

app.get("/resume-lens/api/status", (req, res) => {
  return res.json({
    success: true,
    message: "server is running",
  });
});

app.use("/resume-lens/api", router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

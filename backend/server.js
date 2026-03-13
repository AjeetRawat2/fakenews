import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";


dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes

// health check
app.get("/", (req, res) => {
  res.send("Fake News Detection API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
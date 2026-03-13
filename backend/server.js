import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoutes from "./routes/analyzeRoute.js";
import connectDB from "./config/db.js";


dotenv.config();

const app = express();
const corsOptions = {
  origin: "*", // Allow all origins (for development)
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type Authorization",
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());

// connect DB
connectDB();

// routes
app.use("/api", analyzeRoutes);
// health check
app.get("/", (req, res) => {
  res.send("Fake News Detection API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
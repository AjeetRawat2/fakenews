import express from "express";
import { analyzeArticle , getAllArticles } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/analyze", analyzeArticle);

router.get("/articles", getAllArticles);

export default router;
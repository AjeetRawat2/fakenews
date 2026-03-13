import Claim from "../model/Claim.js";
import express from "express";
import ArticleAnalysis from "../model/ArticleAnalysis.js";
import { searchFactCheck } from "../services/factcheck.js";
import { extractNewsText } from "../services/dataextraction.js";
import { normalizeClaim } from "../utils/normalizeClaim.js";
import { generateClaimId } from "../utils/generateClaimId.js";
function detectInputType(input) {
  try {
    new URL(input);
    return "url";
  } catch {
    return "plain_text";
  }
}

export const analyzeArticle = async (req, res) => {

  const { text } = req.body;

  try {

    if (!text) {
      return res.status(400).json({ message: "Input text is required" });
    }

    // Detect type
   const inputType = detectInputType(text);

    let content = text;

    // If URL → extract article text
    if (inputType === "url") {

      const extractedText = await extractNewsText(text);

      if (!extractedText) {
        return res.status(400).json({
          message: "Failed to extract article text from URL"
        });
      }

      content = extractedText;
    }

    // Now content contains clean news text
    const claims = [content];


    let verdict = "unverified";
    let credibilityScore = 50;
    let explanation = "No fact-check evidence found";
for (let claim of claims) {

  const normalizedClaim = normalizeClaim(claim);

  const claim_id = generateClaimId(normalizedClaim);

  // check if claim already exists
  let existingClaim = await Claim.findOne({ claim_id });

  if (!existingClaim) {

    const result = await searchFactCheck(claim);

    let verdict = "unverified";

    if (result?.claims?.length) {
      verdict = result.claims[0].claimReview[0].textualRating;
    }

    existingClaim = await Claim.create({
      claim_id,
      claimText: claim,
      normalizedClaim,
      verdict
    });

  }

}

    const article = await ArticleAnalysis.create({
      extractedClaims: claims,
      credibilityScore,
      verdict,
      explanation,
      inputType
    });

    res.json(article);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: error.message });

  }
};
export const getAllArticles = async (req, res) => {

    try {

        const articles = await ArticleAnalysis.find().sort({ createdAt: -1 });

        res.json(articles);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

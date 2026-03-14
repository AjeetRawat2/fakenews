import Claim from "../model/Claim.js";
import ArticleAnalysis from "../model/ArticleAnalysis.js";
import ExtractedArticle from "../model/ExtractedArticle.js";

import { searchFactCheck } from "../services/factcheck.js";
import { extractNewsText } from "../services/dataExtraction.js";
import { extractArticleStructure } from "../services/nlpExtraction.js";
import { extractClaims } from "../services/claimExtraction.js";

import { detectInputType } from "../utils/detectInputType.js";
import { normalizeClaim } from "../utils/normalizeClaim.js";
import { generateClaimId } from "../utils/generateClaimId.js";

import { updateFakeClaim } from "../services/fakeClaimDetector.js";
import { reasonAboutClaim } from "../services/claimReasoner.js";

/*
Aggregate internal severity scores into
a frontend-friendly risk score
*/

const aggregateSeverity = (severity) => {
  if (!severity) return null;

  const score = severity.final_risk_score;

  let level = "low";

  if (score >= 75) level = "critical";
  else if (score >= 60) level = "high";
  else if (score >= 40) level = "medium";

  return {
    score,
    level,
  };
};

/*
Aggregate article risk from all claims
*/

const aggregateArticleRisk = (claimAnalyses) => {
  const scores = claimAnalyses.map((c) => c.risk?.score).filter(Boolean);

  if (!scores.length) return null;

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  let level = "low";

  if (avgScore >= 75) level = "critical";
  else if (avgScore >= 60) level = "high";
  else if (avgScore >= 40) level = "medium";

  return {
    score: Math.round(avgScore),
    level,
  };
};

export const analyzeArticle = async (req, res) => {
  const { text, body } = req.body;

  try {
    if (!text) {
      return res.status(400).json({
        message: "Input text is required",
      });
    }

    const inputType = detectInputType(text);

    let title = text;
    let content = body || text;

    /*
    If URL → scrape article
    */

    if (inputType === "url") {
      const extractedText = await extractNewsText(text);

      if (!extractedText) {
        return res.status(400).json({
          message: "Failed to extract article text",
        });
      }

      content = extractedText;
      title = extractedText.split("\n")[0];
    }

    const fullArticleText = `${title}\n\n${content}`;

    /*
    NLP ARTICLE EXTRACTION
    */

    const structure = await extractArticleStructure(fullArticleText);

    /*
    Generate article ID
    */

    const article_id = generateClaimId(fullArticleText.slice(0, 200));

    /*
    Prevent duplicate articles
    */

    let extractedArticle = await ExtractedArticle.findOne({ article_id });

    if (!extractedArticle) {
      extractedArticle = await ExtractedArticle.create({
        article_id,
        url: inputType === "url" ? text : null,
        title: structure?.title || title,
        author: null,
        publish_date: null,

        content: {
          text: fullArticleText,
          summary: structure?.summary || null,
          language: "en",
          word_count: fullArticleText.split(" ").length,
        },

        entities: {
          people: structure?.people || [],
          organizations: structure?.organizations || [],
          locations: structure?.locations || [],
        },

        keywords: structure?.keywords || [],

        topic: {
          category: structure?.topic_category || null,
          subcategory: structure?.topic_subcategory || null,
          confidence: null,
        },
      });
    }

    /*
    CLAIM EXTRACTION
    */

    const extractedClaims = await extractClaims(fullArticleText);

    let processedClaims = [];
    let claimAnalyses = [];

    let verdict = "unverified";
    let credibilityScore = 50;
    let explanation = "No fact-check evidence found";

    /*
    PROCESS CLAIMS
    */

    for (const claimText of extractedClaims) {
      const normalizedClaim = normalizeClaim(claimText);
      const claim_id = generateClaimId(normalizedClaim);

      let existingClaim = await Claim.findOne({ claim_id });

      let claimVerdict = "unverified";
      let source = null;
      let factURL = null;
      let score = 50;

      const factCheckResult = await searchFactCheck(claimText);

      if (!existingClaim) {
        if (factCheckResult?.claims?.length) {
          const review = factCheckResult.claims[0].claimReview[0];

          claimVerdict = review.textualRating.toLowerCase();
          source = review.publisher.name;
          factURL = review.url;

          score = claimVerdict === "false" ? 10 : 80;

          verdict = claimVerdict;
          explanation = source;
          credibilityScore = score;
        }

        existingClaim = await Claim.create({
          claim_id,
          claimText: claimText,
          normalizedClaim,
          verdict: claimVerdict,
          source,
          factCheckURL: factURL,
          credibilityScore: score,
        });
      }

      /*
      FakeClaim Intelligence Layer
      */

      const fakeClaimData = await updateFakeClaim({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
        topic: extractedArticle.topic,
        keywords: extractedArticle.keywords,
        verdict: claimVerdict,
      });

      /*
      Reasoning Layer
      */

      const reasoningResult = await reasonAboutClaim({
        claim: claimText,
        factCheckResult,
        fakeClaimData,
      });

      claimAnalyses.push({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
        verdict: reasoningResult.verdict,
        credibilityScore: reasoningResult.credibilityScore,
        risk: aggregateSeverity(fakeClaimData?.severity),
        reasoning: reasoningResult.reasoning,
      });

      processedClaims.push({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
      });
    }

    /*
    Update article with claims
    */

    extractedArticle.claims = processedClaims;

    await extractedArticle.save();

    /*
    Calculate article risk
    */

    const articleRisk = aggregateArticleRisk(claimAnalyses);

    /*
    Save Article Analysis
    */

    const articleAnalysis = await ArticleAnalysis.create({
      url: inputType === "url" ? text : null,
      extractedClaims,
      claimAnalyses,
      credibilityScore,
      verdict,
      explanation,
      risk: articleRisk,
    });

    res.json({
      extractedArticle,
      articleAnalysis,
      risk: articleRisk,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const articles = await ArticleAnalysis.find().sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

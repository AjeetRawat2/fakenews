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

export const analyzeArticle = async (req, res) => {
  const { text, body } = req.body;

  try {
    if (!text) {
      return res.status(400).json({
        message: "Input text is required",
      });
    }

    /*
    Detect input type
    */

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
          people: (structure?.people || []).map((p) =>
            typeof p === "string" ? p : p.name,
          ),

          organizations: (structure?.organizations || []).map((o) =>
            typeof o === "string" ? o : o.name,
          ),

          locations: (structure?.locations || []).map((l) =>
            typeof l === "string" ? l : l.name,
          ),
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

      /*
      FactCheck API
      */

      const factCheckResult = await searchFactCheck(claimText);

      /*
      FakeClaim propagation intelligence
      */

      const fakeClaimData = await updateFakeClaim({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
        topic: extractedArticle.topic,
        keywords: extractedArticle.keywords,
      });

      /*
      AI reasoning
      */

      const reasoningResult = await reasonAboutClaim({
        claim: claimText,
        factCheckResult,
        fakeClaimData,
      });

      const claimVerdict = reasoningResult.verdict;
      const score = reasoningResult.credibilityScore;
      const reasoning = reasoningResult.reasoning;

      /*
      Save claim if not exists
      */

      if (!existingClaim) {
        existingClaim = await Claim.create({
          claim_id,
          claimText: claimText,
          normalizedClaim,
          verdict: claimVerdict,
          credibilityScore: score,
          source:
            factCheckResult?.claims?.[0]?.claimReview?.[0]?.publisher?.name ||
            null,
          factCheckURL:
            factCheckResult?.claims?.[0]?.claimReview?.[0]?.url || null,
        });
      }

      processedClaims.push({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
      });

      claimAnalyses.push({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
        verdict: claimVerdict,
        credibilityScore: score,
        reasoning,
      });
    }

    /*
    Update article with claims
    */

    extractedArticle.claims = processedClaims;
    await extractedArticle.save();

    /*
    Compute overall article score
    */

    const scores = claimAnalyses.map((c) => c.credibilityScore);

    if (scores.length) {
      credibilityScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (credibilityScore > 75) verdict = "likely_true";
      else if (credibilityScore < 30) verdict = "likely_false";
      else verdict = "mixed";
    }

    explanation = "Verdict computed from claim-level verification";

    /*
    Save Article Analysis
    */

    const articleAnalysis = await ArticleAnalysis.create({
      url: inputType === "url" ? text : null,

      extractedClaims: extractedClaims,

      claimAnalyses,

      credibilityScore,

      verdict,

      explanation,
    });

    res.json({
      extractedArticle,
      articleAnalysis,
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

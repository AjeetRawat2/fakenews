import Claim from "../model/Claim.js";
import ArticleAnalysis from "../model/ArticleAnalysis.js";
import ExtractedArticle from "../model/ExtractedArticle.js";

import { searchFactCheck } from "../services/factcheck.js";
import { extractNewsText } from "../services/dataExtraction.js";
import { extractArticleStructure } from "../services/nlpExtraction.js";
import { extractClaims } from "../services/claimExtraction.js";

import { updateFakeClaim } from "../services/fakeClaimDetector.js";
import { reasonAboutClaim } from "../services/claimReasoner.js";

import { detectInputType } from "../utils/detectInputType.js";
import { normalizeClaim } from "../utils/normalizeClaim.js";
import { generateClaimId } from "../utils/generateClaimId.js";

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
          people: (structure?.people || []).map((p) => p.name || p),
          organizations: (structure?.organizations || []).map(
            (o) => o.name || o,
          ),
          locations: (structure?.locations || []).map((l) => l.name || l),
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

      let factCheckResult = null;
      let claimVerdict = "unverified";
      let source = null;
      let factURL = null;
      let score = 50;

      /*
      If claim not in DB → check fact API
      */

      if (!existingClaim) {
        factCheckResult = await searchFactCheck(claimText);

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
      FakeClaim propagation tracking
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
      Claim reasoning engine
      */

      const reasoningResult = await reasonAboutClaim({
        claim: claimText,
        factCheckResult,
        fakeClaimData,
      });

      processedClaims.push({
        claim_id,
        claim_text: claimText,
        normalized_claim: normalizedClaim,
        verdict: reasoningResult.verdict,
        credibilityScore: reasoningResult.credibilityScore,
        reasoning: reasoningResult.reasoning,
      });
    }

    /*
    Update article with claims
    */

    extractedArticle.claims = processedClaims;

    await extractedArticle.save();

    /*
    Save Article Analysis
    */

    const articleAnalysis = await ArticleAnalysis.create({
      url: inputType === "url" ? text : null,

      extractedClaims: extractedClaims,

      credibilityScore,

      verdict,

      explanation,

      claimAnalyses: processedClaims,
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

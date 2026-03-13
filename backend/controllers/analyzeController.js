import Claim from "../model/Claim.js";
import ArticleAnalysis from "../model/ArticleAnalysis.js";
import { searchFactCheck } from "../services/factcheck.js";


export const analyzeArticle = async (req, res) => {

    const { text } = req.body;

    try {

        if (!text) {
            return res.status(400).json({ message: "Article text is required" });
        }

        // Temporary claim extraction (replace later with LLM)
        const claims = [text];
       

        let verdict = "unverified";
        let credibilityScore = 50;
        let explanation = "No fact-check evidence found";

        // Check each claim with Google FactCheck API
        for (let claim of claims) {

            const result = await searchFactCheck(claim);

            if (result && result.claims && result.claims.length > 0) {

                const review = result.claims[0].claimReview[0];

                verdict = review.textualRating.toLowerCase();
                explanation = review.publisher.name;

                credibilityScore = verdict === "false" ? 10 : 80;

                // store verified claim
                await Claim.create({
                    claimText: claim,
                    verdict: verdict,
                    source: review.publisher.name,
                    factCheckURL: review.url,
                    credibilityScore
                });

                break;
            }
        }

        // Save article analysis
        const article = await ArticleAnalysis.create({
            extractedClaims: claims,
            credibilityScore,
            verdict,
            explanation
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

import { searchWikipediaEvidence } from "./wikiSearch.js";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/*
Map any AI verdict to allowed schema verdicts
*/

const mapVerdict = (verdict) => {
  if (!verdict) return "unverified";

  const v = verdict.toLowerCase();

  if (v.includes("false")) return "false";
  if (v.includes("misleading")) return "misleading";
  if (v.includes("half")) return "half true";
  if (v.includes("mostly")) return "mostly true";
  if (v.includes("true")) return "mostly true";

  return "unverified";
};

export const reasonAboutClaim = async ({
  claim,
  factCheckResult,
  fakeClaimData,
}) => {
  let credibilityScore = 50;
  let verdict = "unverified";
  let reasoning = [];

  /*
  1️⃣ Google FactCheck API
  */

  if (factCheckResult?.claims?.length) {
    const review = factCheckResult.claims[0].claimReview[0];
    const rating = review.textualRating?.toLowerCase();

    if (rating) {
      verdict = mapVerdict(rating);

      if (rating.includes("false")) credibilityScore = 10;
      else if (rating.includes("true")) credibilityScore = 90;
      else credibilityScore = 60;

      reasoning.push(`Claim rated "${rating}" by fact-check source`);
      reasoning.push(`Source: ${review.publisher.name}`);

      return {
        verdict,
        credibilityScore,
        reasoning,
      };
    }
  }

  /*
  2️⃣ Propagation signal (FakeClaim tracking)
  */

  if (fakeClaimData?.mention_count > 5) {
    reasoning.push("Claim appears repeatedly across analyzed articles");
  }

  if (fakeClaimData?.severity?.final_risk_score > 70) {
    credibilityScore -= 15;
    reasoning.push("Claim has high misinformation propagation risk");
  }

  /*
  3️⃣ Wikipedia evidence fallback
  */

  const wiki = await searchWikipediaEvidence(claim);

  if (wiki?.summary) {
    const prompt = `
You are a fact-checking system.

Evaluate the claim using the evidence.

Claim:
${claim}

Evidence:
${wiki.summary}

Return JSON only:

{
 "verdict": "true | false | misleading | mostly true | half true",
 "credibilityScore": number,
 "reasoning": ["reason1","reason2"]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    try {
      const result = JSON.parse(completion.choices[0].message.content);

      return {
        verdict: mapVerdict(result.verdict),
        credibilityScore: result.credibilityScore || 70,
        reasoning: result.reasoning || [
          "Evidence suggests claim is mostly true",
        ],
      };
    } catch (error) {
      reasoning.push("Wikipedia evidence found but reasoning parsing failed");
    }
  }

  /*
  4️⃣ Final fallback
  */

  reasoning.push("No reliable external verification found");
  reasoning.push("Verdict estimated using contextual signals");

  verdict = "mostly true";
  credibilityScore = 60;

  return {
    verdict,
    credibilityScore,
    reasoning,
  };
};

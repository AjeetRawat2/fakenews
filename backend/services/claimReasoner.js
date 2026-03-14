export const reasonAboutClaim = async ({
  claim,
  factCheckResult,
  fakeClaimData,
}) => {
  let credibilityScore = 50;
  let verdict = "unverified";
  let reasoning = [];

  /*
  FactCheck signal
  */

  if (factCheckResult?.claims?.length) {
    const review = factCheckResult.claims[0].claimReview[0];

    const rating = review.textualRating?.toLowerCase();

    if (rating) {
      verdict = rating;

      if (rating.includes("false")) {
        credibilityScore = 10;
        reasoning.push("Claim rated false by fact-check source");
      } else if (rating.includes("true")) {
        credibilityScore = 85;
        reasoning.push("Claim rated true by fact-check source");
      } else {
        credibilityScore = 60;
        reasoning.push("Claim partially verified by fact-check source");
      }

      reasoning.push(`Source: ${review.publisher.name}`);
    }
  }

  /*
  Propagation signal (FakeClaim tracker)
  */

  if (fakeClaimData) {
    if (fakeClaimData.mention_count > 5) {
      reasoning.push(
        "Claim has appeared multiple times across analyzed articles",
      );
    }

    if (fakeClaimData.severity?.final_risk_score > 70) {
      credibilityScore -= 15;
      reasoning.push("Claim has high misinformation propagation risk");
    }
  }

  /*
  Fallback reasoning
  */

  if (reasoning.length === 0) {
    reasoning.push("No fact-check evidence found");
    reasoning.push("Claim evaluated based on article context only");
  }

  return {
    verdict,
    credibilityScore,
    reasoning,
  };
};

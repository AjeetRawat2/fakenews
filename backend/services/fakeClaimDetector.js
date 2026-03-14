import FakeClaim from "../model/FakeClaim.js";

/*
Simple scoring helpers
*/

const calculateImpactScore = (mentionCount) => {
  if (mentionCount > 20) return 90;
  if (mentionCount > 10) return 70;
  if (mentionCount > 5) return 50;
  return 30;
};

const calculateRecencyScore = (firstDetected) => {
  const now = Date.now();
  const hoursSince =
    (now - new Date(firstDetected).getTime()) / (1000 * 60 * 60);

  if (hoursSince < 24) return 90;
  if (hoursSince < 72) return 70;
  if (hoursSince < 168) return 50;
  return 30;
};

export const updateFakeClaim = async ({
  claim_id,
  claim_text,
  normalized_claim,
  topic,
  keywords,
  verdict,
}) => {
  try {
    let fakeClaim = await FakeClaim.findOne({ claim_id });

    /*
    Existing fake claim → update spread metrics
    */

    if (fakeClaim) {
      fakeClaim.mention_count += 1;
      fakeClaim.last_updated = new Date();

      const impact = calculateImpactScore(fakeClaim.mention_count);
      const recency = calculateRecencyScore(fakeClaim.first_detected);

      fakeClaim.severity = {
        impact_score: impact,
        recency_score: recency,
        final_risk_score: Math.round((impact + recency) / 2),
      };

      await fakeClaim.save();

      return fakeClaim;
    }

    /*
    New suspicious claim
    */

    const impact = calculateImpactScore(1);
    const recency = calculateRecencyScore(new Date());

    fakeClaim = await FakeClaim.create({
      claim_id,
      claim_text,
      normalized_claim,

      topic: {
        category: topic?.category || null,
        subcategory: topic?.subcategory || null,
      },

      keywords: keywords || [],

      verdict: verdict || "unverified",

      mention_count: 1,

      severity: {
        impact_score: impact,
        recency_score: recency,
        final_risk_score: Math.round((impact + recency) / 2),
      },
    });

    return fakeClaim;
  } catch (error) {
    console.error("FakeClaim update error:", error.message);
    return null;
  }
};


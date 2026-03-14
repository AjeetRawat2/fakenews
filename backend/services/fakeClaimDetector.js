import FakeClaim from "../model/FakeClaim.js";

/*
Impact score → how widely the claim is spreading
*/

const calculateImpactScore = (mentionCount) => {
  if (mentionCount > 20) return 90;
  if (mentionCount > 10) return 70;
  if (mentionCount > 5) return 50;
  return 30;
};

/*
Recency score → how recently the claim appeared
*/

const calculateRecencyScore = (firstDetected) => {
  const now = Date.now();
  const hoursSince =
    (now - new Date(firstDetected).getTime()) / (1000 * 60 * 60);

  if (hoursSince < 24) return 90;
  if (hoursSince < 72) return 70;
  if (hoursSince < 168) return 50;
  return 30;
};

/*
Harm score → potential societal damage if people believe the claim
*/

const calculateHarmScore = (topic) => {
  const category = topic?.category?.toLowerCase();

  if (!category) return 40;

  if (category.includes("health")) return 95;
  if (category.includes("election")) return 90;
  if (category.includes("politics")) return 85;
  if (category.includes("finance")) return 80;
  if (category.includes("war")) return 85;
  if (category.includes("crime")) return 75;
  if (category.includes("science")) return 50;
  if (category.includes("technology")) return 40;
  if (category.includes("entertainment")) return 20;

  return 40;
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
      const harm = calculateHarmScore(fakeClaim.topic);

      fakeClaim.severity = {
        impact_score: impact,
        recency_score: recency,
        harm_score: harm,
        final_risk_score: Math.round((impact + recency + harm) / 3),
      };

      await fakeClaim.save();

      return fakeClaim;
    }

    /*
    New suspicious claim
    */

    const impact = calculateImpactScore(1);
    const recency = calculateRecencyScore(new Date());
    const harm = calculateHarmScore(topic);

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
        harm_score: harm,
        final_risk_score: Math.round((impact + recency + harm) / 3),
      },
    });

    return fakeClaim;
  } catch (error) {
    console.error("FakeClaim update error:", error.message);
    return null;
  }
};

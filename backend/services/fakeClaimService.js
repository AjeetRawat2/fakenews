import FakeClaim from "../model/FakeClaim.js";

export async function findClaim(claimId) {
  return FakeClaim.findOne({ claim_id: claimId });
}

export async function updateClaimStats(claimId) {
  return FakeClaim.updateOne(
    { claim_id: claimId },
    {
      $inc: { mention_count: 1 },
      $set: { last_updated: new Date() },
    },
  );
}

export async function insertClaim(claim, article) {
  const newClaim = new FakeClaim({
    claim_id: claim.claim_id,
    claim_text: claim.claim_text,
    normalized_claim: claim.normalized_claim,

    topic: article.topic,
    keywords: article.keywords,
  });

  return newClaim.save();
}
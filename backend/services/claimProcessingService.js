import {
  findClaim,
  updateClaimStats,
  insertClaim,
} from "./fakeClaimService.js";

export async function processClaim(claim, article) {
  const existing = await findClaim(claim.claim_id);

  if (existing) {
    await updateClaimStats(claim.claim_id);

    return {
      status: "existing",
      claim: existing,
    };
  }

  const newClaim = await insertClaim(claim, article);

  return {
    status: "new",
    claim: newClaim,
  };
}

export async function processArticleClaims(article) {
  const results = [];

  for (const claim of article.claims) {
    const result = await processClaim(claim, article);

    results.push(result);
  }

  return results;
}
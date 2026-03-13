import crypto from "crypto";

export const generateClaimId = (normalizedClaim) => {

  const hash = crypto
    .createHash("sha256")
    .update(normalizedClaim)
    .digest("hex");

  return hash;
};
import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema({
  claim_id: {
    type: String,
    required: true,
    unique: true
  },

  claimText: String,

  normalizedClaim: String,

  verdict: String,

  source: String,

  credibilityScore: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Claim = mongoose.model("Claim", ClaimSchema);

export default Claim;
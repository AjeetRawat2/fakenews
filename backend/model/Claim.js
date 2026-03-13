import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema({
  claimText: {
    type: String,
    required: true
  },

  verdict: {
    type: String,
    enum: ["true", "false", "misleading", "unverified"]
  },

  source: {
    type: String
  },

  factCheckURL: {
    type: String
  },

  credibilityScore: {
    type: Number
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Claim", ClaimSchema);
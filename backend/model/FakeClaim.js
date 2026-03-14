import mongoose from "mongoose";

const { Schema } = mongoose;

const FakeClaimSchema = new Schema({
  claim_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  claim_text: String,

  normalized_claim: {
    type: String,
    index: true,
  },

  topic: {
    category: String,
    subcategory: String,
  },

  keywords: [String],

  verdict: {
    type: String,
    default: "unverified",
  },

  confidence: {
    type: Number,
    default: 0,
  },

  mention_count: {
    type: Number,
    default: 1,
  },

  severity: {
    impact_score: Number,
    recency_score: Number,
    final_risk_score: Number,
  },

  first_detected: {
    type: Date,
    default: Date.now,
  },

  last_updated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("FakeClaim", FakeClaimSchema);

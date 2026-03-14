import mongoose from "mongoose";

const { Schema } = mongoose;

const FakeClaimSchema = new Schema(
  {
    claim_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    claim_text: {
      type: String,
      required: true,
    },

    normalized_claim: {
      type: String,
      required: true,
      index: true,
    },

    /*
    Topic classification
    */

    topic: {
      category: {
        type: String,
        default: null,
      },

      subcategory: {
        type: String,
        default: null,
      },
    },

    /*
    Keywords related to claim
    */

    keywords: {
      type: [String],
      default: [],
    },

    /*
    Claim status
    */

    verdict: {
      type: String,
      default: "unverified",
    },

    confidence: {
      type: Number,
      default: 0,
    },

    /*
    Claim spread tracking
    */

    mention_count: {
      type: Number,
      default: 1,
    },

    /*
    Risk scoring
    */

    severity: {
      impact_score: {
        type: Number,
        default: 0,
      },

      recency_score: {
        type: Number,
        default: 0,
      },

      harm_score: {
        type: Number,
        default: 0,
      },

      final_risk_score: {
        type: Number,
        default: 0,
      },
    },

    /*
    Timeline tracking
    */

    first_detected: {
      type: Date,
      default: Date.now,
    },

    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/*
Indexes
*/

FakeClaimSchema.index({ "topic.category": 1 });
FakeClaimSchema.index({ mention_count: -1 });
FakeClaimSchema.index({ "severity.final_risk_score": -1 });

export default mongoose.model("FakeClaim", FakeClaimSchema);

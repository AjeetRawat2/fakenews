import mongoose from "mongoose";

const { Schema } = mongoose;

const ArticleAnalysisSchema = new Schema(
  {
    url: {
      type: String,
      default: null,
    },

    /*
    Claims extracted from article
    */

    extractedClaims: {
      type: [String],
      default: [],
    },

    /*
    Detailed claim reasoning results
    */

    claimAnalyses: [
      {
        claim_id: String,

        claim_text: String,

        normalized_claim: String,

        verdict: {
          type: String,
          default: "unverified",
        },

        credibilityScore: {
          type: Number,
          default: 50,
        },

        reasoning: {
          type: [String],
          default: [],
        },
      },
    ],

    /*
    Overall article score
    */

    credibilityScore: {
      type: Number,
      default: 50,
    },

    verdict: {
      type: String,
      default: "unverified",
    },

    explanation: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/*
Indexes for faster queries
*/

ArticleAnalysisSchema.index({ credibilityScore: -1 });
ArticleAnalysisSchema.index({ verdict: 1 });
ArticleAnalysisSchema.index({ createdAt: -1 });

export default mongoose.model("ArticleAnalysis", ArticleAnalysisSchema);

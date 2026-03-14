import mongoose from "mongoose";

const { Schema } = mongoose;

const ClaimSchema = new Schema(
  {
    claim_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    claimText: {
      type: String,
      required: true,
    },

    normalizedClaim: {
      type: String,
      required: true,
      index: true,
    },

    verdict: {
      type: String,
      default: "unverified",
      enum: [
        "true",
        "mostly true",
        "half true",
        "misleading",
        "false",
        "unverified",
      ],
    },

    credibilityScore: {
      type: Number,
      default: 50,
    },

    source: {
      type: String,
      default: null,
    },

    factCheckURL: {
      type: String,
      default: null,
    },

    /*
    claim intelligence fields
    */

    occurrenceCount: {
      type: Number,
      default: 1,
    },

    firstSeen: {
      type: Date,
      default: Date.now,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/*
Indexes for fast lookup
*/

ClaimSchema.index({ verdict: 1 });
ClaimSchema.index({ credibilityScore: -1 });

export default mongoose.model("Claim", ClaimSchema);

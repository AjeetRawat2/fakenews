import mongoose from "mongoose";
import ClaimSchema from "./Claim.js";

const { Schema } = mongoose;

const ExtractedArticleSchema = new Schema(
  {
    article_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    source: {
      type: String,
    },

    author: {
      type: String,
    },

    publish_date: {
      type: Date,
      index: true,
    },

    scraped_at: {
      type: Date,
      default: Date.now,
    },

    content: {
      text: {
        type: String,
        required: true,
      },

      summary: {
        type: String,
      },

      language: {
        type: String,
        default: "en",
      },

      word_count: {
        type: Number,
      },
    },

    entities: {
      people: {
        type: [String],
        default: [],
      },

      organizations: {
        type: [String],
        default: [],
      },

      locations: {
        type: [String],
        default: [],
      },
    },

    topic: {
      category: {
        type: String,
        index: true,
      },

      subcategory: {
        type: String,
        index: true,
      },

      confidence: {
        type: Number,
      },
    },

    keywords: {
      type: [String],
      default: [],
      index: true,
    },

    claims: {
      type: [ClaimSchema],
      default: [],
    },

    metadata: {
      source_reliability: {
        type: Number,
      },

      article_type: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

ExtractedArticleSchema.index({ "topic.category": 1 });
ExtractedArticleSchema.index({ publish_date: -1 });
ExtractedArticleSchema.index({ keywords: 1 });
ExtractedArticleSchema.index({ "claims.claim_id": 1 });

export default mongoose.model("ExtractedArticle", ExtractedArticleSchema);

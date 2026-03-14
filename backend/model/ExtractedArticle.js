import mongoose from "mongoose";

const { Schema } = mongoose;

const ExtractedArticleSchema = new Schema({
  article_id: {
    type: String,
    required: true,
    unique: true,
  },

  url: {
    type: String,
    default: null,
  },

  title: {
    type: String,
    default: null,
  },

  author: {
    type: String,
    default: null,
  },

  publish_date: {
    type: Date,
    default: null,
  },

  content: {
    text: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      default: null,
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
      default: null,
    },

    subcategory: {
      type: String,
      default: null,
    },

    confidence: {
      type: Number,
      default: null,
    },
  },

  keywords: {
    type: [String],
    default: [],
  },

  claims: [
    {
      claim_id: String,
      claim_text: String,
      normalized_claim: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ExtractedArticleSchema.index({ "entities.locations": 1 });
ExtractedArticleSchema.index({ "entities.organizations": 1 });
ExtractedArticleSchema.index({ "topic.category": 1 });
ExtractedArticleSchema.index({ keywords: 1 });
ExtractedArticleSchema.index({ createdAt: -1 });

export default mongoose.model("ExtractedArticle", ExtractedArticleSchema);

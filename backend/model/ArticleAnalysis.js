import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema({

  url: String,

  title: String,

  extractedClaims: [
    {
      type: String
    }
  ],

  credibilityScore: Number,

  verdict: String,

  explanation: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("ArticleAnalysis", ArticleSchema);
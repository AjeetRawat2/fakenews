import mongoose from "mongoose";

const ClusterSchema = new mongoose.Schema({

  topic: String,

  claims: [
    {
      type: String
    }
  ],

  mentionCount: Number,

  riskScore: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Cluster", ClusterSchema);
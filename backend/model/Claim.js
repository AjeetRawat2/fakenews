import mongoose from "mongoose";

const { Schema } = mongoose;

const ClaimSchema = new Schema(
  {
    claim_id: {
      type: String,
      required: true,
      index: true,
    },

    claim_text: String,

    normalized_claim: String,
  },
  { _id: false },
);

export default ClaimSchema;

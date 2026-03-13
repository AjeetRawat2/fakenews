import mongoose from "mongoose";

const { Schema } = mongoose;

const ClaimSchema = new Schema(
  {
    claim_id: {
      type: String,
      required: true,
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
  },
  { _id: false },
);

export default ClaimSchema;

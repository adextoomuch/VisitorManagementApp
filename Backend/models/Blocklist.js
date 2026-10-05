const mongoose = require("mongoose");

const blocklistSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    mobileNo: {
      type: String,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blocklist", blocklistSchema);







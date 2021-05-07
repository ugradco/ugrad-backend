const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    reason: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

tokenSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Reports", tokenSchema);

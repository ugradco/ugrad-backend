const mongoose = require("mongoose");

const upvoteSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.ObjectId, required: true },
    userId: { type: mongoose.ObjectId, required: true },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 43200,
    },
  },
  { timestamps: true },
);

upvoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Upvotes", upvoteSchema);

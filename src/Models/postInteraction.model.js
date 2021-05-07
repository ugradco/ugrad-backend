const { POST_INTERACTION } = require("Constants/global.constants");
const mongoose = require("mongoose");

const postInteractionSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.ObjectId, required: true },
    userId: { type: mongoose.ObjectId, required: true },
    // comment, post, upvote
    type: {
      type: Number,
      enum: Object.values(POST_INTERACTION),
    },
  },
  { timestamps: true },
);

postInteractionSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("PostInteractions", postInteractionSchema);

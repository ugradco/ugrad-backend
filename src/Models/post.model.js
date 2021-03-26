const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    text: String,
    visibility: { type: Boolean, default: true },
    user: {
      id: mongoose.ObjectId,
      alias: String,
      short_bio: String,
    },
    feedback: [], // TODO: decide how to store this
    comments: [
      {
        user: {
          id: mongoose.ObjectId,
          alias: String,
        },
        message: String,
      },
    ],
    tags: [],
    images: [String],
    keywords: [String],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

module.exports = mongoose.model("Post", postSchema);

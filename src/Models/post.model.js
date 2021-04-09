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
          short_bio: String,
        },
        message: String,
        comments: Array,
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

postSchema.methods.findAndUpdateParentComment = function findAndUpdateParentComment(commentId, newComment) {
  const queue = [this];

  const parentComments = [];

  for (let j = 0; j < this.comments.length; j += 1) {
    parentComments.push(this.comments[j]);
  }

  while (queue.length > 0) {
    const visiting = queue.shift();

    if (visiting.comments) {
      for (let j = 0; j < visiting.comments.length; j += 1) {
        if (visiting.comments[j]._id.toString() === commentId) {
          visiting.comments[j].comments.push(newComment);
          return parentComments;
        }
        queue.push(visiting.comments[j]);
      }
    }
  }

  return parentComments;
};

// DFS

module.exports = mongoose.model("Post", postSchema);

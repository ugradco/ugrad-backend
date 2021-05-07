const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    text: String,
    visibility: { type: Boolean, default: true },
    user: {
      id: { type: mongoose.ObjectId, select: false },
      alias: String,
      shortBio: String,
      profileImage: String,
    },
    upvoteCount: { type: Number, default: 0 },
    comments: [
      {
        user: {
          id: { type: mongoose.ObjectId, select: false },
          alias: String,
          shortBio: String,
          profileImage: String,
        },
        message: String,
        comments: Array,
      },
    ],
    tags: [
      {
        type: String,
        index: true,
      },
    ],
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

postSchema.methods.findAndUpdateUserComments = function findAndUpdateComments(user) {
  const queue = [this];

  const parentComments = [];

  for (let j = 0; j < this.comments.length; j += 1) {
    parentComments.push(this.comments[j]);
  }

  while (queue.length > 0) {
    const visiting = queue.shift();

    if (visiting.comments) {
      for (let j = 0; j < visiting.comments.length; j += 1) {
        console.log("visiting.comments[j].user.id", visiting.comments[j].user.id, user.id);
        if (visiting.comments[j].user.id && visiting.comments[j].user.id.toString() === user.id.toString()) {
          console.log("Match");
          visiting.comments[j].user = user;
        }
        queue.push(visiting.comments[j]);
      }
    }
  }

  return parentComments;
};

// DFS

module.exports = mongoose.model("Post", postSchema);

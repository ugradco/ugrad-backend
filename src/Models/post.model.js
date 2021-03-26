const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  text: String,
  visibility: {type: Boolean, default: true},
  user: {
    id: ObjectId,
    alias: String,
    short_bio: String,
  },
  feedback: Array, // TODO: decide how to store this
  comments: [{
      user: {
        id: ObjectId,
        alias: String,
      },
      message: String,
  }],
  tags: Array,
  images: Array,
  keywords: Array,
}, {timestamps: {
  createdAt: "created_at",
  updatedAt: "updated_at",
}});

module.exports = mongoose.model('Post', postSchema);
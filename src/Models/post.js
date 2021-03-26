const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  text: String,
  visibility: Boolean,
  user: {
    id: ObjectId,
    alias: String,
    short_bio: String
  },
  feedback: Array,
  comments: [{
      user: {
        id: ObjectId,
        alias: String
      },
      message: String,
  }],
  tags: Array,
  images: Array,
  keywords: Array,
  publish_date: Date,
  last_activity_date: Date
});

module.exports = mongoose.model('Post', postSchema);
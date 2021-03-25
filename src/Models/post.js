const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  text: String,
  visibility: Boolean,
  id: Number,
  user_id: Number,
  feedback: Array,
  comment_count: Number,
  comments: Array,
  tags: Array,
  images: Array,
  keywords: Array,
  publish_date: Date,
  last_activity_date: Date
});

module.exports = mongoose.model('Post', postSchema);
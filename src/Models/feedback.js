const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  id: Number,
  user_id: Number,
  parent_id: Number,
  type: Number,
  text: String
});

module.exports = mongoose.model('Post', feedbackSchema);
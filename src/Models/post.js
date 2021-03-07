const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  text: String,
  visibility: Boolean
});

module.exports = mongoose.model('Post', postSchema);
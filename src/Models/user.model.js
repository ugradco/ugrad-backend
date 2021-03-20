const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: Number,
  name: String,
  email: { type: String, unique: true, index: true, required: true },
  confirmationCode: {
    type: String,
    unique: true,
  },
  alias: String,
  followed_topics: Array,
  banned_until: Date,
  restricted_until: Date,
  profile_image: String,
  engagement_score: Number,
});

module.exports = mongoose.model("User", userSchema);

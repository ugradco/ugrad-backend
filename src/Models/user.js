const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: Number,
    name: String,
    email: String,
    alias: String,
    followed_topics: Array,
    banned_until: Date,
    restricted_until: Date,
    profile_image: String,
    engagement_score: Number, 
});

module.exports = mongoose.model('User', userSchema);
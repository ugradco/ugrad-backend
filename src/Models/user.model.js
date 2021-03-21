const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const Token = require("./token.model");

const userSchema = new Schema({
  id: Number,
  name: String,
  email: { type: String, unique: true, index: true, required: true },
  alias: String,
  followed_topics: Array,
  banned_until: Date,
  restricted_until: Date,
  profile_image: String,
  engagement_score: Number,
});

// Bearer Token
userSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  let payload = {
    id: this._id,
    email: this.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
  });
};

// Email verification Token
userSchema.methods.generateVerificationToken = function () {
  console.log("userId", this._id, this);

  // Only use uppercase characters
  // exclude abcdefghijklmnopqrstuvwxyz
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }

  let payload = {
    userId: this._id,
    token: token,
  };

  return new Token(payload);
};

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const { Schema } = mongoose;

const jwt = require("jsonwebtoken");

const Token = require("./token.model");

const userSchema = new Schema({
  id: Number,
  name: String,
  admin: Boolean,
  email: { type: String, unique: true, index: true, required: true },
  alias: { type: String, unique: true, required: true },
  short_bio: String,
  followed_topics: [],
  banned_until: Date,
  restricted_until: Date,
  profile_image: String,
  engagement_score: Number,
});

// Bearer Token
userSchema.methods.generateJWT = function generateJWT() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  const payload = {
    id: this._id,
    email: this.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
  });
};

// Email verification Token
userSchema.methods.generateVerificationToken = function generateVerificationToken() {
  // Only use uppercase characters
  // exclude abcdefghijklmnopqrstuvwxyz
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < 6; i += 1) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }

  console.log("userId", this._id, this, token);
  const payload = {
    userId: this._id,
    token,
  };

  return new Token(payload);
};

module.exports = mongoose.model("User", userSchema);

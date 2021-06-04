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
  shortBio: String,
  followedTopics: [],
  bannedUntil: Date,
  restrictedUntil: Date,
  profileImage: String,
  engagementScore: Number,
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

  const payload = {
    userId: this._id,
    token,
  };

  return new Token(payload);
};

/* eslint no-bitwise:0 */
const stolenBaby53 = function stolenBaby53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i += 1) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 53 * (2097151 & h2) + (h1 >>> 0);
};

userSchema.methods.getAlias = function generateAlias() {
  return `Anonymous#${stolenBaby53(this.email)}`;
};

module.exports = mongoose.model("User", userSchema);

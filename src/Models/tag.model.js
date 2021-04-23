const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: { type: String, unique: true, index: true, required: true },
  parentTag: {
    type: String,
  },
  childTags: Array,
});

module.exports = mongoose.model("Tags", tagSchema);

// exchange, izdivac, bos, yurt, market, dilekce
// sosyal-sorun - hayvanlar, temizlik, cevre, okul-kararlari

// /tags

// courses, math106

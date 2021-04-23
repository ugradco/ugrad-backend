const Tag = require("Models/tag.model");

// ToDo: check parentTag
exports.create = async function create(req, res) {
  const { name, parentTag, childTags } = req.body;

  try {
    const newTag = new Tag({
      name,
      parentTag,
      childTags,
    });

    const tag = await newTag.save();

    return res.status(200).json({ tag, message: "A tag has been published." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.index = async (req, res) => {
  const tags = await Tag.find({});
  res.status(200).json({ tags });
};

exports.show = async (req, res) => {
  const { name } = req.params;

  try {
    const tag = await Tag.findOne(name);

    if (!tag) return res.status(404).json({ message: "Tag does not exist" });

    return res.status(200).json({ tag });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.update = async function updateTag(req, res) {
  const { name } = req.params;
  const update = req.body;
  let tag = await Tag.findOne({ name });

  if (!tag) {
    return res.status(404).json({ message: "Couldn't find a tag" });
  }

  try {
    if (req.user.admin) {
      tag = await Tag.findOneAndUpdate({ name }, { $set: update });

      return res.status(200).json({ tag, message: "Tag has been updated" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(400).json({ message: "Not authorized" });
};

exports.delete = async function deleteTag(req, res) {
  const { name } = req.params;

  if (req.user.admin) {
    await Tag.deleteOne({ name });
    return res.status(200).json({ message: "Post has been deleted" });
  }

  return res.status(400).json({ message: "Not authorized" });
};

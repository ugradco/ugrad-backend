const Post = require("Models/post.model");

exports.feed = async function (req, res) {
  const posts = await Post.find({});
  res.status(200).json({ posts });
};

exports.create = async function (req, res) {
  //TODO: control bad words, images etc.
  try {
    const { text, images, tags, isPublic } = req.body;

    const newPost = new Post({
      text,
      images,
      tags,
      user: {
        id: req.user._id,
        alias: isPublic ? req.user.name : req.user.alias,
        short_bio: isPublic ? req.user.short_bio : undefined,
      },
    });

    const post = await newPost.save();
    await post.save();

    res.status(200).json({ message: "A post has been published." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
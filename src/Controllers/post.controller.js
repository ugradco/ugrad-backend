const Post = require("Models/post.model");
const Report = require("Models/report.model");

const POSTS_PER_PAGE = 20;

exports.feed = async function feed(req, res) {
  const { page } = req.body;

  // TODO: improve pagination by using post id's as limit
  // iow: find posts after certain postId's
  const posts = await Post.find({ visibility: true })
    .sort({ $natural: -1 })
    .skip((page || 0) * POSTS_PER_PAGE)
    .limit(POSTS_PER_PAGE);

  return res.status(200).json({ posts });
};

exports.create = async function create(req, res) {
  // TODO: control bad words, images etc.
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

    return res.status(200).json({ message: "A post has been published." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.report = async function report(req, res) {
  const { postId, reason } = req.body;

  const reportedPost = Post.findOne({ _id: postId });

  if (!reportedPost) {
    return res.status(404);
  }

  const newReport = new Report({
    postId,
    userId: req.user._id,
    reason,
  });

  await newReport.save();

  await Post.updateOne({ _id: postId }, { visibility: false }, { runValidators: true });

  return res.status(200).json(newReport);
};

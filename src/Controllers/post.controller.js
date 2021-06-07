const mongoose = require("mongoose");
const Filter = require("bad-words");
const Post = require("Models/post.model");
const PostInteraction = require("Models/postInteraction.model");
const Tag = require("Models/tag.model");
const Upvote = require("Models/upvote.model");
const Report = require("Models/report.model");
const { POST_INTERACTION } = require("Constants/global.constants");

const { wordBlacklist } = require("Utils/wordBlacklist");

const POSTS_PER_PAGE = 20;
const REPORT_LIMIT = 3;

const BadWordFilter = new Filter();
BadWordFilter.addWords(...wordBlacklist);

exports.feed = async function feed(req, res) {
  const { tags = [], search = "", page = 0 } = req.query;

  // TODO: improve pagination by using post id's as limit
  // iow: find posts after certain postId's
  let posts = [];

  const queryOptions = { visibility: true };
  if (tags.length > 0) {
    queryOptions.tags = { $all: tags };
  }
  if (search) {
    queryOptions.$text = { $search: search };
  }

  const postCount = await Post.count(queryOptions, null);

  posts = await Post.find(queryOptions, null)
    .lean()
    .sort({ updated_at: -1 })
    .skip(page * POSTS_PER_PAGE)
    .limit(POSTS_PER_PAGE);

  const upVoteResults = await Promise.all(
    posts.map((post) => Upvote.findOne({ postId: post._id, userId: req.user._id })),
  );

  const personalizedPosts = posts.map((post, index) => {
    const newPost = { ...post };

    if (upVoteResults[index]) {
      newPost.upvoted = true;
    } else {
      newPost.upvoted = false;
    }

    return newPost;
  });

  const pageCount = Math.ceil(postCount / POSTS_PER_PAGE);
  const hasMore = pageCount > page + 1;

  return res.status(200).json({ posts: personalizedPosts, pageCount, hasMore, postsPerPage: POSTS_PER_PAGE });
};

exports.upvote = async function upvote(req, res) {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Couldn't find post" });
    }

    const previousUpvote = await Upvote.findOne({
      userId: req.user._id,
      postId: id,
    });

    if (previousUpvote) {
      // If upvote exists remove it
      const deletedUpvote = await Upvote.deleteOne({
        userId: req.user._id,
        postId: id,
      });

      if (deletedUpvote.deletedCount) {
        await Post.updateOne({ _id: id }, { $inc: { upvoteCount: -1 } });
        return res.status(200).json({ message: "Upvote removed" });
      }
      return res.status(400).json({ message: "Upvote couldn't removed, there was an error" });
    }

    // If Upvote doesn't exists create it
    const newUpvote = new Upvote({
      userId: req.user._id,
      postId: id,
    });

    await newUpvote.save();
    await Post.updateOne({ _id: id }, { $inc: { upvoteCount: 1 } });

    return res.status(200).json({ message: "Upvoted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async function create(req, res) {
  // TODO: control bad words, images etc.
  try {
    const { text, images, tags = [], isPublic } = req.body;

    if (isPublic && !req.user.name) {
      return res.status(400).json({ message: "User name is required for public posts" });
    }

    if (BadWordFilter.isProfane(text)) {
      return res.status(400).json({ message: "Watch your language and post it again :)" });
    }

    // Check tags
    const tagResults = await Promise.all(tags.map((tag) => Tag.findOne({ name: tag })));

    if (tagResults.includes(null)) {
      return res.status(400).json({ message: "Tag couldn't found" });
    }

    const newPost = new Post({
      text,
      images,
      tags,
      user: {
        id: isPublic ? req.user._id : undefined,
        alias: isPublic ? req.user.name : req.user.getAlias(),
        shortBio: isPublic ? req.user.shortBio : undefined,
        profileImage: isPublic ? req.user.profileImage : undefined,
      },
    });

    const post = await newPost.save();

    // Create an POST interaction
    if (isPublic) {
      const newPostInteraction = new PostInteraction({
        postId: post._id,
        userId: req.user._id,
        type: POST_INTERACTION.POST,
      });

      await newPostInteraction.save();
    }

    return res.status(200).json({ post, message: "A post has been published." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async function deletePost(req, res) {
  const { id } = req.params;
  // Admin delete
  if (req.user.admin) {
    await Post.deleteOne({ _id: id });
    await PostInteraction.deleteOne({ postId: id });
    return res.status(200).json({ message: "Post has been deleted" });
  }
  // user delete = soft delete
  return res.status(401).json({ message: "Not authorized" });
};

exports.report = async function report(req, res) {
  const { postId, reason } = req.body;

  const reportedPost = Post.findOne({ _id: postId });

  if (!reportedPost) {
    return res.status(404);
  }

  if (req.user.admin) {
    await Post.updateOne({ _id: postId }, { visibility: false }, { runValidators: true });
    return res.status(200).json({ message: "Post has been hidden" });
  }

  const prevReport = await Report.findOne({ postId, userId: req.user._id }).lean();
  if (prevReport) {
    return res.status(200).json(prevReport);
  }

  const newReport = new Report({
    postId,
    userId: req.user._id,
    reason,
  });

  await newReport.save();

  // Change visibility if report count reaches REPORT_LIMIT
  const reportCount = await Report.count({ postId });
  if (reportCount >= REPORT_LIMIT) {
    await Post.updateOne({ _id: postId }, { visibility: false }, { runValidators: true });
  }

  return res.status(200).json(newReport);
};

exports.comment = async function comment(req, res) {
  const { postId, commentId, message, isPublic } = req.body;

  const post = await Post.findOne({ _id: postId });
  if (!post) {
    return res.status(404).json("Post doesn't exist");
  }

  if (isPublic && !req.user.name) {
    return res.status(400).json("User name doesn't exist");
  }

  const newComment = {
    _id: mongoose.Types.ObjectId(),
    parentId: commentId || postId,
    user: {
      id: isPublic ? req.user._id : undefined,
      alias: isPublic ? req.user.name : req.user.getAlias(),
      shortBio: isPublic ? req.user.shortBio : undefined,
      profileImage: isPublic ? req.user.profileImage : undefined,
    },
    message,
    comments: [],
  };

  // Create or update interaction if comment is public
  if (isPublic) {
    // Check previous interaction
    const previousInteraction = await PostInteraction.findOne({ postId, userId: req.user._id });

    if (previousInteraction) {
      if (previousInteraction.type === POST_INTERACTION.POST) {
        await PostInteraction.updateOne(
          { postId, userId: req.user._id },
          { $set: { type: POST_INTERACTION.POST_AND_COMMENT } },
        );
      }
    } else {
      // Create an COMMENT interaction
      const newPostInteraction = new PostInteraction({
        postId,
        userId: req.user._id,
        type: POST_INTERACTION.COMMENT,
      });

      await newPostInteraction.save();
    }
  }

  if (commentId) {
    // Recursive comment finder
    const parentComment = post.findAndUpdateParentComment(commentId, newComment);

    await Post.updateOne({ _id: postId }, { $set: { comments: parentComment } });
  } else {
    if (post.comments === undefined) {
      post.comments = [];
    }

    post.comments.push(newComment);

    await Post.updateOne({ _id: postId }, { $set: { comments: post.comments } });
  }
  return res.status(200).json("Comment posted!");
};

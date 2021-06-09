const _ = require("lodash");

const User = require("Models/user.model");
const Post = require("Models/post.model");
const PostInteraction = require("Models/postInteraction.model");
const { POST_INTERACTION } = require("Constants/global.constants");
// const {  sendEmail } = require("../utils/index");

/**
 * @route GET api/user/me
 * @desc Returns a specific user
 * @access Public
 */
exports.me = async (req, res) => {
  try {
    const user = _.pick(req.user, ["_id", "email", "name", "alias", "shortBio", "profileImage"]);

    return res.status(200).json({ ...user, alias: req.user.getAlias() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route GET admin/user
 * @desc Returns all users
 * @access Public
 */
exports.index = async (req, res) => {
  const users = await User.find({});
  const filteredUsers = users.map((user) => _.pick(user, ["_id", "email", "name", "shortBio", "profileImage"]));

  res.status(200).json({ filteredUsers });
};

// For testing purposes
exports.create = async (req, res) => {
  const { email, name } = req.body;

  const user = new User({ email, name });
  user.save(
    (err) => {
      console.log("Failed", err);
    },
    () => {
      console.log("Yeey");
    },
  );
  res.status(200).send("Hey success");
};

/**
 * @route POST api/user
 * @desc Add a new user
 * @access Public
 */
exports.store = async (req, res) => {
  try {
    const { email } = req.body;

    // Make sure this account doesn't already exist
    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({
        message:
          "The email address you have entered is already associated with another account. You can change this users role instead.",
      });
    }

    const password = `_ ${Math.random().toString(36).substr(2, 9)}`; // generate a random password
    const newUser = new User({ ...req.body, password });

    const user_ = await newUser.save();

    // Generate and set password reset token
    user_.generatePasswordReset();

    // Save the updated user object
    await user_.save();

    // Get mail options
    // const domain = "http://" + req.headers.host;
    // const subject = "New Account Created";
    // const to = user.email;
    // const from = process.env.FROM_EMAIL;
    // const link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
    // const html = `<p>Hi ${user.username}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href="${link}">link</a> to set your password and login.</p>
    //               <br><p>If you did not request this, please ignore this email.</p>`;

    // await sendEmail({ to, from, subject, html });

    return res.status(200).json({ message: `An email has been sent to ${user.email}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET api/user/{id}
 * @desc Returns a specific user
 * @access Public
 */
exports.show = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User does not exist" });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route PUT api/user/{id}
 * @desc Update user details
 * @access Public
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const userId = req.user._id;

    // Make sure the passed id is that of the logged in user
    if ((userId.toString() !== id.toString() && !req.user.admin) || (update.admin && !req.user.admin)) {
      return res.status(401).json({
        message: "Sorry, you don't have the permission to update this data.",
      });
    }

    // Remove unsupported update fields
    Object.keys(update)
      .filter((key) => !["name", "shortBio", "profileImage", "admin"].includes(key))
      .forEach((key) => delete update[key]);

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true });

    const postInteractions = await PostInteraction.find({ userId: id }).lean();

    const updatedUserInfo = {
      id: user._id,
      alias: user.name,
      shortBio: user.shortBio,
      // profileImage: user.profileImage,
    };

    // ToDo:
    // Add update limit

    // Update all posts
    let commentedPosts = [];
    await Promise.all(
      postInteractions.map((interaction) => {
        if (interaction.type === POST_INTERACTION.POST) {
          return Post.updateOne(
            { _id: interaction.postId },
            {
              $set: {
                user: updatedUserInfo,
              },
            },
            { timestamps: false },
          );
        }

        commentedPosts.push(
          Post.findById(interaction.postId).select({
            user: { id: 1 },
            comments: 1,
          }),
        );
        return null;
      }),
    );

    commentedPosts = await Promise.all(commentedPosts);

    await Promise.all(
      commentedPosts.map((post) => {
        if (!post) return;

        const newComments = post.findAndUpdateUserComments(updatedUserInfo);

        const postUpdates = {
          comments: newComments,
        };

        console.log(
          "newComments",
          newComments.map((comment) => comment.user),
        );

        if (post.user.id && post.user.id.toString() === updatedUserInfo.id.toString()) {
          postUpdates.user = updatedUserInfo;
        }

        return Post.updateOne(
          { _id: post._id },
          {
            $set: postUpdates,
          },
          { timestamps: false },
        );
      }),
    );

    // if there is no image, return success message
    if (!req.file) return res.status(200).json({ user, message: "User has been updated" });

    return res.status(200).json({ user, message: "User has been updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/**
 * @route DESTROY api/user/{id}
 * @desc Delete User
 * @access Public
 */
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;

    // Make sure the passed id is that of the logged in user
    if (req.user._id.toString() !== id.toString()) {
      return res.status(401).json({
        message: "Sorry, you don't have the permission to delete this data.",
      });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

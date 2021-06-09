const User = require("Models/user.model");
const Token = require("Models/token.model");
const { sendVerificationTokenEmail } = require("Utils/index");

// @route POST api/user/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const { email } = req.body;

    // Only allow koc emails
    if (!email.includes("@ku.edu.tr")) {
      return res.status(400).json({ success: false, message: "You can only login with Koc University email accounts" });
    }

    const normalizedEmail = email.toLowerCase();

    // Make sure this account doesn't already exist
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return sendVerificationEmail(user, req, res);
    }

    const newUser = new User({ email: normalizedEmail });

    const user_ = await newUser.save();

    return sendVerificationEmail(user_, req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ normalizedEmail });

    if (!user) {
      return res.status(401).json({
        msg: `The email address ${email} is not associated with any account. Double-check your email address and try again.`,
      });
    }

    // Validate password
    // TODO
    // if (!user.comparePassword(password))
    //   return res.status(401).json({ message: "Invalid email or password" });

    // Make sure the user has been verified
    // TODO
    // if (!user.isVerified)
    //   return res
    //     .status(401)
    //     .json({
    //       type: "not-verified",
    //       message: "Your account has not been verified.",
    //     });

    const token = await Token.findOne({ token: req.body.token });

    if (!token) {
      return res.status(400).json({
        message: "We were unable to find a valid token. Your token may have expired.",
      });
    }

    // If we found a token, find a matching user
    User.findOne({ _id: token.userId }, (err, user) => {
      if (!user) return res.status(400).json({ message: "We were unable to find a user for this token." });

      if (user.email !== email) return res.status(400).json({ message: "User and token doesn't match :(" });
    });

    // Login successful, write token, and send back user
    return res.status(200).json({ token: user.generateJWT(), user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// EMAIL VERIFICATION
// @route GET api/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
  if (!req.params.token) return res.status(400).json({ message: "We were unable to find a user for this token." });

  try {
    // Find a matching token
    const token = await Token.findOne({ token: req.params.token });

    if (!token) {
      return res.status(400).json({
        message: "We were unable to find a valid token. Your token my have expired.",
      });
    }

    // If we found a token, find a matching user
    User.findOne({ _id: token.userId }, (err, user) => {
      if (!user) return res.status(400).json({ message: "We were unable to find a user for this token." });

      if (user.isVerified) return res.status(400).json({ message: "This user has already been verified." });

      // Verify and save the user
      user.isVerified = true;
      user.save(function (err) {
        if (err) return res.status(500).json({ message: err.message });

        res.status(200).send("The account has been verified. Please log in.");
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message:
          "The email address " +
          req.body.email +
          " is not associated with any account. Double-check your email address and try again.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "This account has already been verified. Please log in.",
      });
    }

    await sendVerificationEmail(user, req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function sendVerificationEmail(user, req, res) {
  try {
    // Check if the user has unexpired token
    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = user.generateVerificationToken();
      // Save the verification token
      await token.save();
    }

    sendVerificationTokenEmail(user, token.token);

    res.status(200).send({
      message: "A verification email has been sent to " + user.email + ".",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

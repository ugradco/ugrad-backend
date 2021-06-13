const express = require("express");
const { check } = require("express-validator");

const Auth = require("Controllers/auth.controller");
// const Password = require("Controllers/password");
const validate = require("Middlewares/validate.middleware");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2, // limit each IP to 2 requests per windowMs
  skipFailedRequests: true,
  message: "Too many register requests, please try again later",
});

router.get("/", (req, res) => {
  res.status(200).json({
    message: "You are in the Auth Endpoint. Register or Login to test Authentication.",
  });
});

router.post(
  "/register",
  [check("email").isEmail().withMessage("Enter a valid email address")],
  validate,
  limiter,
  Auth.register,
);

router.post(
  "/login",
  [check("email").isEmail().withMessage("Enter a valid email address"), check("token").not().isEmpty()],
  validate,
  Auth.login,
);

// EMAIL Verification
// router.get("/verify/:token", Auth.verify);
// router.post("/resend", Auth.resendToken);

// Password RESET
// router.post(
//   "/recover",
//   [check("email").isEmail().withMessage("Enter a valid email address")],
//   validate,
//   Password.recover
// );

// router.get("/reset/:token", Password.reset);

// router.post(
//   "/reset/:token",
//   [
//     check("password")
//       .not()
//       .isEmpty()
//       .isLength({ min: 6 })
//       .withMessage("Must be at least 6 chars long"),
//     check("confirmPassword", "Passwords do not match").custom(
//       (value, { req }) => value === req.body.password
//     ),
//   ],
//   validate,
//   Password.resetPassword
// );

module.exports = router;

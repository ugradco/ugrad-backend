const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const UserController = require("Controllers/user.controller");

router.get("/me", UserController.me);

const profileUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 1, // limit each IP to 1 requests per windowMs
  skipFailedRequests: true,
  message: "Too many register requests, please try again later",
  skip: (req) => Boolean(req.user.admin),
});

router.patch("/:id", profileUpdateLimiter, UserController.update);

router.get("/:id", UserController.show);

router.get("/", UserController.index);

router.post("/", UserController.create);

module.exports = router;

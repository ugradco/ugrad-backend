const express = require("express");
const { check } = require("express-validator");
const validate = require("Middlewares/validate.middleware");

const router = express.Router();
const PostController = require("Controllers/post.controller");

// TODO: split posts to send them in batches
router.post("/", PostController.create);
router.get("/feed", PostController.feed);
router.post(
  "/comment",
  [check("postId").not().isEmpty().withMessage("Post Id is required")],
  validate,
  PostController.comment,
);
router.post("/report", PostController.report);

module.exports = router;

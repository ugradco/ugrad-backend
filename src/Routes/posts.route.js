const express = require("express");
const { check } = require("express-validator");
const validate = require("Middlewares/validate.middleware");

const router = express.Router();
const PostController = require("Controllers/post.controller");

router.post(
  "/",
  [
    check("text").not().isEmpty().withMessage("text is required"),
    check("tags").not().isEmpty().withMessage("tags should not be empty"),
  ],
  validate,
  PostController.create,
);

router.post("/upvote/:id", PostController.upvote);

router.delete("/:id", PostController.delete);

router.get("/feed", PostController.feed);

router.post(
  "/comment",
  [check("postId").not().isEmpty().withMessage("postId is required")],
  validate,
  PostController.comment,
);

router.post("/report", PostController.report);

module.exports = router;

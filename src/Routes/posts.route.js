const express = require("express");

const router = express.Router();
const PostController = require("Controllers/post.controller");

// TODO: split posts to send them in batches
router.post("/", PostController.create);
router.get("/feed", PostController.feed);
router.post("/report", PostController.report);

module.exports = router;

const express = require("express");

const router = express.Router();

const Post = require("Models/post.model");
const PostController = require("Controllers/poat.controller");

// TODO: split posts to send them in batches
router.get("/feed", PostController.feed);

router.post("/post", PostController.create);


module.exports = router;
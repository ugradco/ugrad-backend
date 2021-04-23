const express = require("express");

const router = express.Router();
const TagController = require("Controllers/tag.controller");

router.get("/", TagController.index);

router.post("/", TagController.create);

router.get("/:name", TagController.show);

router.patch("/:name", TagController.update);

router.delete("/:name", TagController.delete);

module.exports = router;

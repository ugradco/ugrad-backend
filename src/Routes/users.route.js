const express = require("express");

const router = express.Router();
const UserController = require("Controllers/user.controller");

router.get("/me", UserController.me);

router.patch("/:id", UserController.update);

router.get("/:id", UserController.show);

router.get("/", UserController.index);

router.post("/", UserController.create);

module.exports = router;

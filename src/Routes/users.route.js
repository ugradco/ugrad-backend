var express = require("express");

var router = express.Router();

const User = require("Models/user.model");
const UserController = require("Controllers/user.controller");

router.get("/", UserController.show);

router.post("/", function (req, res) {
  const { email } = req.body;

  const user = new User({ email, name: "ghost" });
  user.save(
    (err) => {
      console.log("Failed", err);
    },
    () => {
      console.log("Yeey");
    }
  );
  res.status(200).send("Hey success");
});

module.exports = router;

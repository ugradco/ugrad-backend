var express = require("express");

var router = express.Router();

const User = require("Models/user.model");

router.get("/", function (req, res) {
  res.send("GET handler for /users route.");
});

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

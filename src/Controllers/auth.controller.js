const config = require("../config/auth.config");
const db = require("./Models");

const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const token = jwt.sign({ email: req.body.email }, "secret");

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    confirmationCode: token,
  });
};

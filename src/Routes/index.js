const auth = require("./auth.route");
const users = require("./users.route");

const authenticate = require("Middlewares/auth.middleware");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.status(200).send({
      message:
        "Welcome to the AUTHENTICATION API. Register or Login to test Authentication.",
    });
  });

  app.use("/auth", auth);
  app.use("/users", authenticate, users);
};

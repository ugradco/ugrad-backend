require("dotenv").config();
const passport = require("passport");
const express = require("express");
const mongoose = require("mongoose");

// Setting up port
const mongoConnUri = process.env.MONGO_CONN_URL;
let PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
// for parsing application/xwww-
// TODO: research
// app.use(express.urlencoded({ extended: false }));

app.listen(PORT, () => {
  console.log("Listening on port 3000");
});

// Set up Database
mongoose.connect(mongoConnUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("MongoDB connection success:");
});

//Bind connection to error event (to get notification of connection errors)
db.on("error", () => {
  console.log("MongoDB connection error:");
  process.exit();
});

// Initialize PASSPORT middleware
app.use(passport.initialize());
require("Middlewares/jwt.middleware")(passport);

// Configure Route
require("Routes/index")(app);

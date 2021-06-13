require("dotenv").config();
const passport = require("passport");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Setting up port
const mongoConnUri = process.env.MONGO_CONN_URL;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, "Public")));

const whitelist = ["https://app.ugrad.co", "http://localhost:3000"];

app.use(
  cors({
    preflightContinue: false,
    credentials: false,
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());
// for parsing application/xwww-
// TODO: research
// app.use(express.urlencoded({ extended: false }));

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
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

// Bind connection to error event (to get notification of connection errors)
db.on("error", () => {
  console.log("MongoDB connection error:");
  process.exit();
});

// Initialize PASSPORT middleware
app.use(passport.initialize());
require("Middlewares/jwt.middleware")(passport);

// Configure Route
require("Routes/index")(app);

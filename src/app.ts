import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import JWTMiddleware from "Middlewares/jwt.middleware";

declare var process: {
  env: {
    NODE_ENV: string;
    MONGO_CONN_URL: string;
    PORT: string;
  };
  exit: any;
};

dotenv.config();
console.log("process.env.MONGO_CONN_URL");

// Setting up port
const mongoConnUri = process.env.MONGO_CONN_URL || "";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
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
JWTMiddleware(passport);

// Configure Route
require("Routes/index")(app);

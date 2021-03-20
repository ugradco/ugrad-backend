require("dotenv").config();

const express = require("express"),
  users = require("Routes/users.route");

const app = express();

app.use(express.json());

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

app.use("/users", users);

// process.env
// mongodb+srv://ugradAdmin:<password>@clusterzero.uknv9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@clusterzero.uknv9.mongodb.net/ugrad?retryWrites=true&w=majority`;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

console.log(uri);
//Bind connection to error event (to get notification of connection errors)
db.on("error", () => {
  console.log("MongoDB connection error:");
});
db.on("open", () => {
  console.log("MongoDB connection success:");
});

// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

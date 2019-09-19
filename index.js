const express = require("express");
const appRoute = require("./router/auth");
const app = express();
const mongoose = require("mongoose");
mongoose.set("debug", true);
mongoose.connect("mongodb://localhost/MongoTask-1", {
  useNewUrlParser: true
});

app.use(express.json());
app.use("/user", appRoute);

app.listen(5000, () => {
  console.log("server up and running");
});

const express = require("express");
const appRoute = require("./Router/auth");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/RealProject-1", {
  useNewUrlParser: true
});

app.use(express.json());
app.use("/api/user", appRoute);

app.listen(4000, () => {
  console.log("server up and running");
});

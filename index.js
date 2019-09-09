const express = require("express");
const appRoute = require("./User Router/auth");
const sellerRoute = require("./Seller Router/auth");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/RealProject-1", {
  useNewUrlParser: true
});

app.use(express.json());
app.use("/api/user", appRoute);
app.use("/seller", sellerRoute);

app.listen(5000, () => {
  console.log("server up and running");
});

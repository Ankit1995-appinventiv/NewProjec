const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dob: {
    type: Date
  },
  image: {
    type: String
  },
  orders: [],
  tokens: [
    {
      token: {
        type: String
      }
    }
  ]
});

let userModel = mongoose.model("User", userSchema);

module.exports = userModel;

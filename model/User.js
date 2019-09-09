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
    type: Date,
    required: true
  },
  image: {
    type: String
  },
  orders: [],
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

let userModel = mongoose.model("User", userSchema);

module.exports = userModel;

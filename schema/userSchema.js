const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userName: {
    firstName: {
      type: String
    },
    secondName: {
      type: String
    }
  },
  social: {
    email: {
      type: String
    },
    password: {
      type: String
    }
  },
  postCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    imageCount: {
      type: Number,
      default: 0
    },
    videoCount: {
      type: Number,
      default: 0
    }
  }
});
let userModel = mongoose.model("userSchema", userSchema);
module.exports = userModel;

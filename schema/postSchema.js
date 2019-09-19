const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  postType: {
    type: Number,
    enum: ["image", "video"]
  },
  title: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  totalComment: {
    type: Number,
    default: 0
  }
});

let postModel = mongoose.model("post", postSchema);
module.exports = postModel;

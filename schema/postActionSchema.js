const mongoose = require("mongoose");

const postAction = mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  likedBy: {
    userId: {
      type: mongoose.Types.ObjectId
    },
    likedTime: { type: Date }
  },
  commentBy: {
    userId: {
      type: mongoose.Types.ObjectId
    },
    commentText: { type: String },
    commentTime: { type: Date },
    postId: { type: mongoose.Types.ObjectId }
  },
  reportedBy: {
    userId: {
      type: mongoose.Types.ObjectId
    }
  }
});

let postModel = mongoose.model("postAction1", postAction);
module.exports = postModel;

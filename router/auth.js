const router = require("express").Router();
const userModel = require("../schema/userSchema");
const mongoose = require("mongoose");
const postModel = require("../schema/postSchema");
const postAction = require("../schema/postActionSchema");
const jwt = require("jsonwebtoken");
const verify = require("../verifyToken");

//final login

router.post("/login", async (req, res) => {
  try {
    const query = await userModel.findOne(
      { "social.email": req.body.email },
      { "social.password": req.body.password }
    );
    const token = jwt.sign({ _id: query._id.toString() }, "SecretKey");
    res.header("auth-token", token).send({ token });
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err.message);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const query = new userModel(req.body);
    const saveQuery = await query.save();

    console.log(saveQuery);
    res.send(saveQuery);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err.message);
  }
});

router.post("/uploadPost", verify, async (req, res) => {
  try {
    req.body.userId = req.user._id;

    const query = await postModel.create(req.body);

    if (query.postType == 0)
      await userModel.updateOne(
        { _id: req.user._id },
        { $inc: { "totalCount.imageCount": 1 } }
      );
    else
      await userModel.updateOne(
        { _id: req.user._id },
        { $inc: { "totalCount.videoCount": 1 } }
      );

    res.send(query);
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/postListingParricularUser", verify, async (req, res) => {
  try {
    //console.log(req.params._id);
    const userPost = await postModel.find({
      userId: req.user._id,
      postType: 0
    });
    console.log(userPost, "hello");
    const query = await userModel.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(req.user._id) }
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "userPosts"
        }
      },

      {
        // $project: { _id: 0, userPosts: 1, userName: 1, totalCount: 1 }
        $project: {
          imagePosts: {
            $filter: {
              input: "$userPosts",
              as: "image",
              cond: { $eq: ["$$image.postType", 0] }
            }
          },

          videoPosts: {
            $filter: {
              input: "$userPosts",
              as: "videos",
              cond: { $eq: ["$$videos.postType", 1] }
            }
          },

          userName: 1,
          totalCount: 1,
          _id: 0,
          userPosts1: 1
        }
      }

      //changes after this

      //upto this
    ]);
    res.send(query);
  } catch (err) {
    res.json({
      message: err.message
    });
  }
});

router.get("/allPosts", verify, async (req, res) => {
  try {
    const userData = userModel.find({
      _id: mongoose.Types.ObjectId(req.user._id)
    });

    const videos = postModel.aggregate([
      {
        $match: {
          postType: 1
        }
      },
      {
        $lookup: {
          from: "postaction1",
          let: {
            post: "$_id",
            user: "$userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$post", "$postId"] },
                    { $eq: ["$$user", "$likedBy.userId"] }
                  ]
                }
              }
            }
          ],
          as: "selfLiked"
        }
      },
      {
        $project: {
          status: {
            $cond: {
              if: { $ifNull: [{ $size: "$selfLiked" }, 1] },
              then: " liked",
              else: "not liked"
            }
          },
          type: 1,
          title: 1,
          userId: 1,
          totalLikes: 1,
          totalComment: 1
        }
      }
    ]);
    const images = postModel.aggregate([
      {
        $match: {
          postType: 0
        }
      },
      {
        $lookup: {
          from: "postaction1",
          let: {
            post: "$_id",
            user: "$userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$post", "$postId"] },
                    { $eq: ["$$user", "$likedBy.userId"] }
                  ]
                }
              }
            }
          ],
          as: "selfLiked"
        }
      },
      {
        $project: {
          status: {
            $cond: {
              if: { $ifNull: [{ $size: "$selfLiked" }, 1] },
              then: " liked",
              else: "not liked"
            }
          },
          type: 1,
          title: 1,
          userId: 1,
          totalLikes: 1,
          totalComment: 1
        }
      }
    ]);
    const [userDetails, imagesPost, videoPost] = await Promise.all([
      userData,
      images,
      videos
    ]);
    //console.log(totalposts)
    res.json({
      UserDetails: userDetails,
      ImagesPosts: imagesPost,
      VideosPosts: videoPost
    });
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/likedPosts/:_id", verify, async (req, res) => {
  try {
    const searchUser = await postAction.findOne({
      "likedBy.userId": req.user._id,
      postId: req.params._id
    });
    console.log(req.user._id);

    if (searchUser) {
      await postModel.updateOne(
        { _id: req.params._id },
        { $inc: { totalLikes: -1 } }
      );

      await postAction.removeOne({ "likedBy.userId": req.user._id });
      return res.send("you disliked this post");
    }

    const query = await postAction.updateOne(
      { postId: req.params._id, "likedBy.userId": req.user._id },
      {
        $set: {
          "likedBy.likedTime": new Date()
        }
      },
      {
        upsert: true
      }
    );
    await postModel.updateOne(
      { _id: req.params._id },
      { $inc: { totalLikes: 1 } }
    );

    res.send(query);
  } catch (err) {
    res.json({
      message: err.message
    });
  }
});

router.post("/commentOnPosts/:_id", verify, async (req, res) => {
  try {
    const searchUser = await postAction.findOne({
      "commentBy.userId": req.user._id,
      postId: req.params._id
    });
    console.log(req.user._id);

    if (searchUser) {
      await postModel.updateOne(
        { _id: req.params._id },
        { $inc: { totalComment: -1 } }
      );

      await postAction.removeOne({ "commentBy.userId": req.user._id });
      return res.send("you comment is deleted");
    }

    const query = await postAction.updateOne(
      { postId: req.params._id, "commentBy.userId": req.user._id },
      {
        $set: {
          "commentBy.likedTime": new Date(),
          "commentBy.commentText": req.body.commentText
        }
      },
      {
        upsert: true
      }
    );
    await postModel.updateOne(
      { _id: req.params._id },
      { $inc: { totalComment: 1 } }
    );

    res.send(query);
  } catch (err) {
    res.json({
      message: err.message
    });
  }
});

router.get("/likeByType", verify, async (req, res) => {
  try {
    const userData = userModel.find({
      _id: mongoose.Types.ObjectId(req.user._id)
    });

    const videos = postModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user._id),
          postType: 1
        }
      },
      {
        $lookup: {
          from: "postaction1",
          let: {
            post: "$_id",
            user: "$userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$post", "$postId"] },
                    { $eq: ["$$user", "$likedBy.userId"] }
                  ]
                }
              }
            }
          ],
          as: "selfLiked"
        }
      },
      {
        $project: {
          status: {
            $cond: {
              if: { $ifNull: [{ $size: "$selfLiked" }, 1] },
              then: " liked",
              else: "not liked"
            }
          },
          type: 1,
          title: 1,
          userId: 1,
          totalLikes: 1,
          totalComment: 1
        }
      }
    ]);
    const images = postModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user._id),
          postType: 0
        }
      },
      {
        $lookup: {
          from: "postaction1",
          let: {
            post: "$_id",
            user: "$userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$post", "$postId"] },
                    { $eq: ["$$user", "$likedBy.userId"] }
                  ]
                }
              }
            }
          ],
          as: "selfLiked"
        }
      },
      {
        $project: {
          status: {
            $cond: {
              if: { $ifNull: [{ $size: "$selfLiked" }, 1] },
              then: " liked",
              else: "not liked"
            }
          },
          type: 1,
          title: 1,
          userId: 1,
          totalLikes: 1,
          totalComment: 1
        }
      }
    ]);
    const [userDetails, imagesPost, videoPost] = await Promise.all([
      userData,
      images,
      videos
    ]);
    //console.log(totalposts)
    res.json({
      UserDetails: userDetails,
      ImagesPosts: imagesPost,
      VideosPosts: videoPost
    });
    // res.json({
    //   userDetails: userData,
    //   ImagesPosts: images,
    //   VideosPosts: videos
    // });
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;

const router = require("express").Router();
const userModel = require("../model/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../verifyTokenSeller");
const productModel = require("../model/products");
const sellerModel = require("../model/seller");
const mongoose = require("mongoose");

// router.post("/addproduct", (req, res) => {});

router.post("/sellerSignup", async (req, res) => {
  const emailExist = await sellerModel.findOne({ email: req.body.email });

  if (emailExist) return res.send("email allready exist");

  //Encoding the password
  const hash = await bcrpyt.hash(req.body.password, 10);
  req.body.password = hash;
  const query = await sellerModel.create(req.body);
  res.send(query);
});

router.post("/sellerLogin", async (req, res) => {
  try {
    const query = await sellerModel.findOne(
      { email: req.body.email },
      { password: req.body.password }
    );
    // console.log(query);
    // if (!query) return res.send("email or password is wrong");

    const token = jwt.sign({ _id: query._id.toString() }, "SellerKey");

    // await query.save();
    // console.log("this is a single time token", token);
    res.header("auth-token", token).send({ token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/insertProduct", verify, async (req, res) => {
  try {
    req.body.seller = req.user._id;

    const query = await productModel.create(req.body);
    await sellerModel.updateOne(
      { _id: req.user._id },
      { $push: { products: query._id } }
    );

    res.send(query);
  } catch (err) {
    res.send(err);
  }
});

router.delete("/deleteProduct/:_id", verify, async (req, res) => {
  try {
    console.log("inseide");
    let updateId = req.params._id;

    const del = await sellerModel.update(
      { _id: req.user._id },
      { $pull: { products: mongoose.Types.ObjectId(updateId) } }
    );
    console.log(del);
    let deletepro = await productModel.deleteOne({ _id: updateId });
    console.log(deletepro);

    console.log("completed");
    res.status(200).json({
      message: "successful",
      data: deletepro
    });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

router.get("/allSellerProducts", verify, async (req, res) => {
  try {
    // console.log(req.user._id);
    // const query = await sellerModel.find({ _id: req.user._id });
    // let data = await sellerModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "products",
    //       foreignField: "_id",
    //       as: "productDet"
    //     }
    //   }
    // ]);

    const seller = await sellerModel.find({ _id: req.user._id });
    if (!seller) return res.send("wrong seller id");
    const data = await productModel.find({ seller: [req.user._id] });
    console.log(data);
    if (data) res.send(data);
    else console.log("err");
  } catch (err) {
    console.log(err);
  }
});

router.post("/updateProduct/:_id", verify, async (req, res) => {
  try {
    let updateId = req.params._id;

    let data = await productModel.findOne({ _id: updateId });
    let du = await productModel.findOne(
      { _id: updateId },
      { _id: 0, seller: 0 }
    );
    console.log(du);
    if (!data) return res.send("data not found");
    if (data.seller[0] == req.user._id) {
      let updatepro = await productModel.updateOne(
        { _id: updateId },
        {
          $set: {
            productname: req.body.productname
          }
        },
        { upsert: true }
      );

      res.status(200).json({
        message: "successful",
        data: updatepro
      });
    } else {
      res.status(400).json({
        message: "permission denied",
        erorr: "you canot update this product"
      });
    }
  } catch (err) {}
});

module.exports = router;

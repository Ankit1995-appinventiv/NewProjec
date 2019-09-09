const router = require("express").Router();
const userModel = require("../model/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../verifyTokenSeller");
const productModel = require("../model/products");
const sellerModel = require("../model/seller");

// router.post("/addproduct", (req, res) => {});

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
    const seller1 = await sellerModel.findOne({ _id: req.user._id });

    if (seller1) {
      req.body.seller = req.user._id;

      const query = await productModel.create(req.body);

      res.send(query);
    } else console.log("seller not found");
  } catch (err) {
    res.send(err);
  }
});

router.delete("/deleteProduct/", verify, async (req, res) => {
  try {
    const sellerId = await sellerModel.findOne({ _id: req.user._id });

    await productModel.remove({ seller: sellerId });

    const seller1 = await sellerModel.findOne({ _id: sellerId });
    await res.status(200).send("product deleted");
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/allProducts", verify, async (req, res) => {
  try {
    const query = await sellerModel.find({});
    if (query) res.send(query);
    else console.log("err");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

const router = require("express").Router();
const userModel = require("../model/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../verifyToken");
const productModel = require("../model/products");

router.post("/register", async (req, res) => {
  const emailExist = await userModel.findOne({ email: req.body.email });

  if (emailExist) return res.send("email allready exist");

  //Encoding the password
  const hash = await bcrpyt.hash(req.body.password, 10);
  req.body.password = hash;

  const comment = new userModel(req.body);

  try {
    const savedata = await comment.save();
    res.send(savedata);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const query = await userModel.findOne({ email: req.body.email });
    if (!query) return res.send("email or password is wrong");

    const dehash = await bcrpyt.compare(req.body.password, query.password);
    if (!dehash) return res.send("email or password is wrong 123");

    const token = jwt.sign({ _id: query._id.toString() }, "SecrteKey");

    if (dehash) query.tokens = await query.tokens.concat({ token });
    console.log(query);
    await query.save();
    console.log("this is a single time token", token);

    res.header("auth-token", token).send({ token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/getProfile/me", verify, async (req, res) => {
  console.log("inside", req.user._id);
  const q = await userModel.findOne(
    { _id: req.user._id },
    { password: 0, _id: 0, tokens: 0 }
  );
  res.send(q);
});

router.get("/allProducts", verify, async (req, res) => {
  try {
    let query = await productModel.find({}, { seller: 0, _id: 0, __v: 0 });
    if (query) return res.send(query);
    else return res.send("user not found");
  } catch (err) {
    res.status(404).send(err);
  }
});

router.get("/addOrders/:_id", verify, async (req, res) => {
  //const queryFind = await productModel.findOne({ _id: req.body.params });
  try {
    let updatepro = await userModel.updateOne(
      { _id: req.user._id },
      {
        $set: {
          orders: req.params._id
        }
      }
    );
    res.send(updatepro);
  } catch (err) {
    res.send(err);
  }
});

router.get("/showOrders", verify, async (req, res) => {
  let query = await userModel.findOne({ _id: req.user._id });
  let data = await productModel.findOne(
    { _id: query.orders },
    { seller: 0, _id: 0, __v: 0 }
  );
  res.send(data);
  //   const a = req.user._id.toString();

  //   let data = await userModel.aggregate([
  //     {
  //       $match: { _id: ObjectId(a) },
  //       $lookup: {
  //         from: "products",
  //         localField: "orders",
  //         foreignField: "_id",
  //         as: "productDet"
  //       }
  //     }
  //   ]);
  //   console.log(data);
  //   res.send(data);
  // } catch (err) {
  //   res.send(err);
  // }
});

module.exports = router;

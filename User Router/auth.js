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

// router.get("/getProfile/:username", verify, async (req, res) => {
//   try {
//     let query = await userModel.findOne({ username: req.params.username });

//     if (query) {
//       const getAge = Math.floor(
//         (new Date() - new Date(query.dob).getTime()) / 3.15576e10
//       );

//       return res.json({ username: query.username, age: getAge });
//     } else return res.send("user not found");
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });
router.get("/getProfile/me", verify, async (req, res) => {
  // console.log("ehy");
  // try {

  //   let query = await userModel.find({});
  //   console.log(query);
  //   if (query) return res.json(query);
  //   else return res.send("something went wrong");
  // } catch (err) {
  //   res.status(400).send(err);
  // }
  console.log("inside", req.user._id);
  const q = await userModel.findOne({ _id: req.user._id });
  res.send(q);
});

router.get("/allProducts", verify, async (req, res) => {
  try {
    let query = await productModel.find({}).pretty();
    if (query) return res.json(query);
    else return res.send("user not found");
  } catch (err) {
    res.status(404).send(err);
  }
});

module.exports = router;

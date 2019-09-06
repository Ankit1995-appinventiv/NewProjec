const router = require("express").Router();
const userModel = require("../model/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../verifyToken");

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

    const token = jwt.sign({ _id: query._id }, "SecrteKey");

    res.header("auth-token", token).send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/getProfile/:username", verify, async (req, res) => {
  try {
    let query = await userModel.findOne({ username: req.params.username });

    if (query) {
      const getAge = Math.floor(
        (new Date() - new Date(query.dob).getTime()) / 3.15576e10
      );

      return res.json({ username: query.username, age: getAge });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;

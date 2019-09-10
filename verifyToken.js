const jwt = require("jsonwebtoken");
const user1 = require("./model/User");

module.exports = async function(req, res, next) {
  try {
    const token = req.header("auth-token");
    if (!token) res.status(401).send("user is not authorized");

    const verified = jwt.verify(token, "SecrteKey");
    const user = await user1.find({
      _id: verified._id,
      "tokens.token": token
    });
    if (!user) throw new Error();
    console.log(user);
    req.user = verified;

    next();
  } catch (err) {
    return res.send(err);
  }
  // const bearerHeader = req.header("Authorization").replace("Bearer ", "");
};

const jwt = require("jsonwebtoken");
const user1 = require("./schema/userSchema");

module.exports = async function(req, res, next) {
  try {
    const token = req.header("auth-token");
    if (!token) res.status(401).send("user is not authorized");

    const verified = jwt.verify(token, "SecretKey");
    const user = await user1.find({
      _id: verified._id,
      "tokens.token": token
    });

    if (!user) throw new Error();
    req.user = verified;

    next();
  } catch (err) {
    console.log(err.message);
    return res.send(err);
  }
};

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const token = req.header("auth-token");
  if (!token) res.status(401).send("user is not authorized");

  try {
    const verified = jwt.verify(token, "SecrteKey");
    req.query = verified;
    next();
  } catch (err) {
    return res.send(err);
  }
};

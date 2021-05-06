const jwt = require("jsonwebtoken");
const User = require("../models/User");
module.exports.isSignedIn = async (req, res, next) => {
  try {
    console.log("Is SIgned ");

    const token = req.header("token");
    console.log("TOKEN HERE ", token);
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).send({
      error: "Please authenticate",
    });
  }
};

const router = require("express").Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      throw new Error();
    }
    const isAuthenticated = await user.comparePasswords(req.body.password);
    if (!isAuthenticated) {
      throw new Error();
    }
    const token = user.createToken();
    user.password = undefined;
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({
      error: "Incorrect credentials",
    });
  }
});
router.post(
  "/signup",
  [
    body("email", "enter correct email").isEmail(),
    body(
      "password",
      "password should contain atleast 8 characters,one uppercase,one lowercase,one number and atleast one special character"
    ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).send({
          error: errors.array()[0].msg,
        });
      }
      const user = await User(req.body);
      user.following.push(user._id);
      await user.save();
      const token = user.createToken();
      res.send({ user, token });
    } catch (e) {
      if (e.code == 11000 && e.name == "MongoError") {
        return res.status(400).send({
          error: "Email is already exists",
        });
      }
      res.status(400).send({
        error: "Can't signup please try again later",
      });
    }
  }
);

module.exports = router;

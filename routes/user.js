const router = require("express").Router();
const User = require("../models/User");
const { isSignedIn } = require("../middleware/auth");
router.delete("/removeAvatar", isSignedIn, async (req, res) => {
  try {
    if (req.user.avatar.id) {
      await cloudinary.uploader.destroy(req.user.avatar.id);
      req.user.avatar.url = "http://www.gravatar.com/avatar/?d=mp";
      req.user.avatar.id = undefined;
      await req.user.save();
    }
    req.user.password = undefined;
    res.send({
      user: req.user,
    });
  } catch (e) {
    res.status(400).send({
      error: "Failed to delete post",
    });
  }
});

router.put("/update/user", isSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.name) {
      user.name = req.body.name;
    }
    await user.save();
    user.password = undefined;
    res.send({ user });
  } catch (e) {
    if (e.code == 11000 && e.name == "MongoError") {
      return res.status(400).send({
        error: "Email is already exists",
      });
    }
    res.status(400).send({
      error: "Failed to update user",
    });
  }
});

router.post("/follow/:following_id", isSignedIn, async (req, res) => {
  try {
    const following = await User.findById(req.params.following_id);
    if (!following) {
      throw new Error();
    }
    console.log(req.user);
    console.log("FOLLOWING_______");
    console.log(following);
    const isFollowing = req.user.following.find((following_id) => {
      return following_id.toString() == following._id;
    });
    console.log(isFollowing);
    if (isFollowing) {
      return res.send({ error: "Already following" });
    }
    req.user.following.push(following._id);
    const user = await req.user.save();
    following.followers.push(user._id);
    await following.save();
    res.send({ user });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: "Could not able to follow",
    });
  }
});

module.exports = router;

const router = require("express").Router();
const User = require("../models/User");
const cloudinary = require("cloudinary");
const { isSignedIn } = require("../middleware/auth");
const Post = require("../models/Post");
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
    console.log(e);
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
    const isFollowing = req.user.following.find((following_id) => {
      return following_id.toString() == following._id;
    });
    if (isFollowing) {
      return res.send({ error: "Already following" });
    }
    req.user.following.push(following._id);
    const user = await req.user.save();
    following.followers.push(user._id);
    await following.save();
    user.password = undefined;
    res.send({ user });
  } catch (e) {
    res.status(400).send({
      error: "Could not able to follow",
    });
  }
});

router.post("/unfollow/:following_id", isSignedIn, async (req, res) => {
  try {
    const following = await User.findById(req.params.following_id);
    if (!following) {
      throw new Error();
    }
    if (following._id.toString() == req.user._id) {
      return res.status(400).send({ error: "U can't unfollow ur self" });
    }
    const isFollowing = req.user.following.find((following_id) => {
      console.log(following_id, following._id);
      return following_id.toString() == following._id;
    });
    if (isFollowing) {
      req.user.following = req.user.following.filter(
        (following_id) => following_id.toString() != following.id
      );
      const user = await req.user.save();
      following.followers = following.followers.filter(
        (follower_id) => follower_id.toString() != req.user._id
      );
      await following.save();
      res.send({ user });
    } else {
      res.status(400).send({ error: "U are not following" });
    }
  } catch (e) {
    res.status(400).send({
      error: "Could not able to unfollow",
    });
  }
});

router.get("/users/find/:name", isSignedIn, async (req, res) => {
  try {
    const users = await User.find({
      name: { $regex: `${req.params.name}`, $options: "i" },
    });
    res.send(users);
  } catch (e) {
    res.status(400).send({
      error: "Failed to find users",
    });
  }
});

router.get("/user/:userId", isSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.send({ error: "No user found" });
    }
    const isFollowing = req.user.following.find((following_id) => {
      return following_id.toString() == user._id;
    });

    let userPosts = await Post.find({ post_by: req.params.userId });
    console.log(userPosts.length);
    if (!isFollowing) {
      return res.send({ user, userPosts: [], postsLength: userPosts.length });
    }
    res.send({ user, userPosts, postsLength: userPosts.length });
  } catch (e) {
    res.status(400).send({
      error: "Failed to retrive posts",
    });
  }
});

router.delete("/user/remove", isSignedIn, async (req, res) => {
  try {
    await req.user.remove();
    res.send({ message: "Account deleted" });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: "Failed to remove User",
    });
  }
});

module.exports = router;

const router = require("express").Router();
const upload = require("../cloudinary");
const User = require("../models/User");
const Post = require("../models/Post");
const cloudinary = require("cloudinary");
const { isSignedIn } = require("../middleware/auth");
router.post("/post", isSignedIn, upload.single("photo"), async (req, res) => {
  try {
    const { title } = req.body;
    let post = new Post({ title });
    post.post_by = req.user._id;
    if (req.file) {
      post.photo.url = req.file.path;
      post.photo.id = req.file.filename;
    }
    post = await post.save();
    res.send(post);
  } catch {
    res.status(400).send({
      error: "Can't upload now try again...",
    });
  }
});

router.delete("/post/:postId", isSignedIn, async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(400).send({
        error: "Post not found",
      });
    }
    await cloudinary.uploader.destroy(post.photo.id);
    await post.remove();
    res.send({
      message: "DELETED SUCCESFULLY",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: "Failed to delete post",
    });
  }
});

module.exports = router;

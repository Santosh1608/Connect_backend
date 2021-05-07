const router = require("express").Router();
const upload = require("../cloudinary");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
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
    if (post.post_by.toString() != req.user._id) {
      return res.status(401).send({ error: "Not authorized" });
    }

    cloudinary.uploader.destroy(post.photo.id);
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

//COMMENT ON POST
router.post("/post/comment/:postId", isSignedIn, async (req, res) => {
  try {
    const comment = new Comment(req.body);
    comment.comment_by = req.user._id;
    await comment.save();
    let post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }
    post.comments.push(comment._id);
    await post.save();
    res.send(post);
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: "Failed to comment",
    });
  }
});
//UPDATE COMMENT
router.put("/post/comment/:postId/:commentId", isSignedIn, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(400).send({ error: "No comment found" });
    }
    if (comment.comment_by.toString() != req.user._id) {
      return res.status(401).send({ error: "Not authorized" });
    }
    comment.comment = req.body.comment;
    await comment.save();
    let post = await Post.findById(req.params.postId);
    res.send(post);
  } catch (e) {
    res.status(400).send({
      error: "Failed to update comment",
    });
  }
});
//DELETE COMMENT
router.delete(
  "/post/comment/:postId/:commentId",
  isSignedIn,
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        return res.status(400).send({ error: "No comment found" });
      }
      if (comment.comment_by.toString() != req.user._id) {
        return res.status(401).send({ error: "Not authorized" });
      }
      await comment.remove();
      let post = await Post.findById(req.params.postId);
      post.comments = post.comments.filter(
        (commentId) => commentId.toString() != req.params.commentId
      );
      await post.save();
      res.send(post);
    } catch (e) {
      res.status(400).send({
        error: "Failed to delete comment",
      });
    }
  }
);

//LIKE THE POST
router.post("/post/like/:postId", isSignedIn, async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId);
    const liked = post.likes.find(
      (userId) => userId.toString() == req.user._id
    );
    if (liked) {
      return res.status(400).send({ error: "Already liked" });
    }
    post.likes.push(req.user._id);
    await post.save();
    res.send(post);
  } catch (e) {
    res.status(400).send({
      error: "Failed to like",
    });
  }
});

//UN LIKE THE POST
router.post("/post/unlike/:postId", isSignedIn, async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId);
    const liked = post.likes.find(
      (userId) => userId.toString() == req.user._id
    );
    if (liked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() != req.user._id
      );
      await post.save();
      res.send(post);
    } else {
      return res.status(400).send({ error: "U have not liked yet" });
    }
  } catch (e) {
    res.status(400).send({
      error: "Failed to unlike",
    });
  }
});
//GET Particular POST
router.get("/post/:postId", isSignedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate([
      {
        path: "comments",
        model: "Comment",
        populate: {
          path: "comment_by",
          model: "User",
        },
      },
      {
        path: "likes",
        model: "User",
      },
      {
        path: "post_by",
        model: "User",
      },
    ]);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }
    res.send(post);
  } catch (e) {
    res.status(400).send({
      error: "Failed to get Post",
    });
  }
});

//GET all foloowing POSTS
router.get("/posts", isSignedIn, async (req, res) => {
  try {
    console.log(req.query);
    const posts = await Post.paginate(
      { post_by: { $in: req.user.following } },
      { page: parseInt(req.query.page), limit: parseInt(req.query.limit) }
    );
    res.send(posts);
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: "Failed to get Posts",
    });
  }
});
module.exports = router;

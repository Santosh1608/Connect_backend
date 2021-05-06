const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  photo: {
    url: String,
    id: String,
  },
  post_by: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);

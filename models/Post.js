const mongoose = require("mongoose");
const Comment = require("./Comment");
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

postSchema.pre("remove", async function (next) {
  await Comment.deleteMany({ _id: { $in: this.comments } });
  console.log("DONE DELETING");
  next();
});

module.exports = mongoose.model("Post", postSchema);

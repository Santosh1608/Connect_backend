const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    avatar: {
      url: {
        type: String,
        default: "http://www.gravatar.com/avatar/?d=mp",
      },
      id: String,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  } catch {
    throw new Error("Something went wrong with password please try again");
  }
});

userSchema.methods.createToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET);
  return token;
};

userSchema.methods.comparePasswords = async function (password) {
  const isAuthenticated = await bcrypt.compare(password, this.password);
  return isAuthenticated;
};

module.exports = mongoose.model("User", userSchema);

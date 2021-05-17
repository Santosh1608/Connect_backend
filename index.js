require("dotenv").config();
require("./db");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");
const path = require("path");
<<<<<<< HEAD
const PORT = process.env.PORT || 8080;
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);
//Server static assets in prod

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

app.listen(PORT, (req, res) => {
  console.log(`Listening on PORT ${PORT}`);
});

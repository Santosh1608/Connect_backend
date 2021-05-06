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

const PORT = process.env.PORT | 8080;
app.get("/", (req, res) => {
  res.send("CONNECT");
});
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", userRoutes);

app.listen(PORT, (req, res) => {
  console.log(`Listening on PORT ${PORT}`);
});

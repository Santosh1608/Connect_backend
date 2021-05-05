require("dotenv").config();
require("./db");
const express = require("express");
const app = express();
app.use(express.json());
const authRoutes = require("./routes/auth");
const PORT = process.env.PORT | 8080;
app.get("/", (req, res) => {
  res.send("CONNECT");
});
app.use("/api", authRoutes);

app.listen(PORT, (req, res) => {
  console.log(`Listening on PORT ${PORT}`);
});

const express = require("express");
const router = express.Router();
require("dotenv").config();
require("../passport");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_LINK);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const authRouter = require("./auth");
const userRouter = require("./user");

router.get("/", (req, res, next) => {
  res.json({ message: "Hi" });
});

router.use("/auth", authRouter);

router.use("/user", userRouter);

module.exports = router;

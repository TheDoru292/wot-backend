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
const tweetRouter = require("./tweet");
const bookmarkRouter = require("./bookmark");
const tagRouter = require("./tag");
const searchRouter = require("./search");
const conversationRouter = require("./conversation");

router.get("/", (req, res, next) => {
  res.json({ message: "Hi" });
});

router.use("/auth", authRouter);

router.use("/user", userRouter);

router.use("/tweet", tweetRouter);

router.use("/bookmark", bookmarkRouter);

router.use("/tag", tagRouter);

router.get("/search", searchRouter);

router.use("/conversation", conversationRouter);

module.exports = router;

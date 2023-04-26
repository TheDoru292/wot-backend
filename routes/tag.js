const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../passport");

const tag = require("../controllers/tagController");
const tweet = require("../controllers/tweetController");

router.get("/", tag.getTags);

router.get("/popular", tag.getPopular);

router.get(
  "/tweets/:tag",
  passport.authenticate(["jwt", "anonymous"], { session: false }),
  tweet.getTweetsByTag
);

module.exports = router;

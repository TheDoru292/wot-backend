const express = require("express");
const router = express.Router();
require("dotenv").config();

const passport = require("passport");
require("../passport");

const User = require("../controllers/userController");
const Tweet = require("../controllers/tweetController");
const Follow = require("../controllers/followController");
const Notification = require("../controllers/notificationController");
const helper = require("../lib/helper");

router.post(
  "/register",
  passport.authenticate("jwt", { session: false }),
  User.register
);

router.get("/", User.getAll);

router.get(
  "/:userHandle",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  User.getProfile
);

router.get(
  "/:userHandle/tweets",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  Tweet.getAllUserTweets
);

router.get("/:userHandle/followers", helper.getUserHandle, Follow.getFollowers);

router.get("/:userHandle/following", helper.getUserHandle, Follow.getFollowing);

router.post(
  "/:userHandle/follow",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  helper.checkAlreadyFollowing,
  Follow.follow
);

router.delete(
  "/:userHandle/follow",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  helper.checkFollowing,
  Follow.deleteFollow
);

router.get(
  "/:userHandle/notifications",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  helper.checkSameUser,
  Notification.get
);

module.exports = router;

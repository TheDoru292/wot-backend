const express = require("express");
const router = express.Router();
require("dotenv").config();

const passport = require("passport");
require("../passport");

const User = require("../controllers/userController");
const Tweet = require("../controllers/tweetController");
const Follow = require("../controllers/followController");
const Comment = require("../controllers/commentController");
const Notification = require("../controllers/notificationController");
const helper = require("../lib/helper");

router.post("/register", User.register);

router.get("/", User.getAll);

router.get(
  "/:userHandle",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  User.getProfile
);

router.put(
  "/:userHandle",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  helper.checkSameUser,
  User.editProfile
);

router.get(
  "/:userHandle/tweets",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  Tweet.getAllUserTweets
);

router.get(
  "/:userHandle/tweets/liked",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  Tweet.getUserLikedTweets
);

router.get(
  "/:userHandle/comments",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  Comment.getUsersAllComments
);

router.get(
  "/:userHandle/followers",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  Follow.getFollowers
);

router.get(
  "/:userHandle/following",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  Follow.getFollowing
);

router.get(
  "/:userHandle/following/tweet",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  helper.checkSameUser,
  Tweet.getFollowingTweets
);

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

router.get(
  "/:userHandle/connect",
  passport.authenticate("jwt", { session: false }),
  helper.getUserHandle,
  helper.checkSameUser,
  User.connect
);

module.exports = router;

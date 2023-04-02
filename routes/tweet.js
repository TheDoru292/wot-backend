const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../passport");

const Tweet = require("../controllers/tweetController");
const Comment = require("../controllers/commentController");
const Bookmark = require("../controllers/bookmarkController");
const retweet = require("../controllers/retweetController");
const Like = require("../controllers/likeController");
const helper = require("../lib/helper");

router.get("/", passport.authenticate("jwt", { session: false }), Tweet.getAll);

router.get(
  "/:tweetId",
  passport.authenticate("jwt", { session: false }),
  Tweet.get
);

router.post("/", passport.authenticate("jwt", { session: false }), Tweet.post);

router.delete(
  "/:tweetId",
  passport.authenticate("jwt", { session: false }),
  helper.checkSameUserTweet,
  Tweet.delete
);

router.put(
  "/:tweetId",
  passport.authenticate("jwt", { session: false }),
  helper.checkSameUserTweet,
  Tweet.edit
);

router.get("/:tweetId/comment", Comment.getTweetAllComments);

router.get("/:tweetId/comment/:commentId", Comment.get);

router.post(
  "/:tweetId/comment",
  passport.authenticate("jwt", { session: false }),
  helper.checkTweetExists,
  Comment.post
);

router.put(
  "/:tweetId/comment/:commentId",
  passport.authenticate("jwt", { session: false }),
  helper.checkSameUserComment,
  Comment.edit
);

router.delete(
  "/:tweetId/comment/:commentId",
  passport.authenticate("jwt", { session: false }),
  helper.checkSameUserComment,
  Comment.delete
);

router.post(
  "/:tweetId/comment/:commentId/like",
  passport.authenticate("jwt", { session: false }),
  helper.checkTweetExists,
  helper.checkCommentLiked,
  Like.likeComment
);

router.post(
  "/:tweetId/bookmark",
  passport.authenticate("jwt", { session: false }),
  helper.checkTweetExists,
  Bookmark.post
);

router.delete(
  "/:tweetId/bookmark",
  passport.authenticate("jwt", { session: false }),
  helper.checkTweetExists,
  Bookmark.delete
);

router.get(
  "/:tweetId/like",
  passport.authenticate("jwt", { session: false }),
  helper.checkTweetExists,
  Like.getLikes
);

router.post(
  "/:tweetId/like",
  passport.authenticate("jwt", { session: false }),
  helper.checkTweetLiked,
  Like.likePost
);

router.get(
  "/:tweetId/retweet",
  passport.authenticate("jwt", { session: false }),
  retweet.getRetweets
);

router.post(
  "/:tweetId/retweet",
  passport.authenticate("jwt", { session: false }),
  helper.checkRetweet,
  retweet.postRetweet
);

module.exports = router;

const User = require("../models/user");
const Tweet = require("../models/tweet");
const ErrorHandler = require("./ErrorHandler");
const comment = require("../models/comment");
const bookmark = require("../models/bookmark");
const follow = require("../models/follow");
const like = require("../models/like");
const retweet = require("../models/retweet");

exports.getUserHandle = (req, res, next) => {
  User.findOne({ handle: req.params.userHandle }, "_id", (err, user) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    if (!user) {
      return res
        .status(400)
        .json({ success: false, status: "User doesn't exist!" });
    }

    console.log(user);

    req.userId = user._id;
    next();
  });
};

exports.checkSameUserTweet = (req, res, next) => {
  Tweet.findOne({ _id: req.params.tweetId }, "user", (err, tweet) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    if (tweet.user.toString() !== req.user._id.toString()) {
      const Error = new ErrorHandler(null, 403);
      return res.status(Error.errCode).json(Error.error);
    }

    next();
  });
};

exports.checkTweetExists = (req, res, next) => {
  Tweet.findOne({ _id: req.params.tweetId }, (err, tweet) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    if (!tweet) {
      return res
        .status(404)
        .json({ success: false, status: "Tweet doesn't exist." });
    }

    next();
  });
};

exports.checkSameUserComment = (req, res, next) => {
  comment.findOne({ _id: req.params.commentId }, (err, comment) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, status: "Comment doesn't exist" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      const Error = new ErrorHandler(null, 403);
      return res.status(Error.errCode).json(Error.error);
    }

    next();
  });
};

exports.checkBookmarkExists = (req, res, next) => {
  bookmark.get(
    { user: req.user._id, tweet: req.params.tweetId },
    (err, bookmark) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      if (!bookmark) {
        return res
          .status(404)
          .json({ success: false, status: "Bookmark doesn't exist." });
      }

      next();
    }
  );
};

exports.checkTweetLiked = (req, res, next) => {
  like.findOne(
    { user: req.user._id, tweet: req.params.tweetId },
    (err, like) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      if (!like) {
        req.liked = false;
      } else {
        req.liked = true;
      }

      next();
    }
  );
};

exports.checkCommentLiked = (req, res, next) => {
  like.findOne(
    { user: req.user._id, comment: req.params.commentId },
    (err, like) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      if (!like) {
        req.liked = false;
      } else {
        req.liked = true;
      }

      next();
    }
  );
};

exports.checkCommentExists = (req, res, next) => {
  Comment.findOne({ _id: req.params.commentId }, (err, comment) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, status: "Comment doesn't exist." });
    }

    next();
  });
};

exports.checkAlreadyFollowing = (req, res, next) => {
  console.log(req.userId.toString());
  console.log(toString(req.user._id));

  if (req.userId.toString() === req.user._id.toString()) {
    const Error = new ErrorHandler(
      null,
      400,
      "You're trying to follow yourself."
    );
    return res.status(Error.errCode).json(Error.error);
  }

  follow.findOne(
    { follower: req.user._id, following: req.userId },
    (err, follow) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      if (follow) {
        const Error = new ErrorHandler(
          null,
          400,
          "You're alredy following the user!"
        );
        return res.status(Error.errCode).json(Error.error);
      }

      next();
    }
  );
};

exports.checkFollowing = (req, res, next) => {
  follow.findOne(
    { follower: req.user._id, following: req.userId },
    (err, follow) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      if (!follow) {
        return res
          .status(400)
          .json({ success: false, status: "You are not following user!" });
      }

      next();
    }
  );
};

exports.checkSameUser = (req, res, next) => {
  if (req.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, status: "Forbidden" });
  }

  next();
};

exports.checkRetweet = (req, res, next) => {
  retweet.findOne(
    { user: req.user._id, retweetedPost: req.params.tweetId },
    (err, retweet) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      console.log(retweet, req.params.tweetId);

      if (!retweet) {
        req.retweeted = false;
      } else {
        req.retweeted = true;
      }

      next();
    }
  );
};

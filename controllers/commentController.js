const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../lib/ErrorHandler");
const notification = require("../models/notification");
const tweet = require("../models/tweet");

exports.getTweetAllComments = (req, res, next) => {
  Comment.find({ tweet: req.params.tweetId })
    .populate("user", "-password")
    .exec((err, comments) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, comments });
    });
};

exports.get = (req, res, next) => {
  Comment.findOne({ _id: req.params.commentId, tweet: req.params.tweetId })
    .populate("user", "-password")
    .exec((err, comment) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, comment });
    });
};

exports.post = [
  body("content").isLength({ min: 3, max: 280 }).trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const Error = new ErrorHandler(
        null,
        400,
        "Check errors array",
        errors.array()
      );
      return res.status(Error.errCode).json(Error.error);
    }

    Comment.create(
      {
        user: req.user._id,
        tweet: req.params.tweetId,
        content: req.body.content,
        posted_on: new Date(),
      },
      (err, comment) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        res.status(200).json({ success: true, comment }).end();
      }
    );

    tweet.findOne({ _id: req.params.tweetId }, "user", (err, tweet) => {
      if (err) {
        console.log(err);
      }

      notification.create(
        {
          notificationUser: tweet.user,
          action: "comment",
          user: req.user._id,
          tweet: req.params.tweetId,
        },
        (err, notif) => {
          if (err) {
            console.log(err);
          }

          console.log("notification created!");
        }
      );
    });
  },
];

exports.edit = [
  body("content").isLength({ min: 3, max: 280 }).trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const Error = new ErrorHandler(
        null,
        400,
        "Check errors array",
        errors.array()
      );
      return res.status(Error.errCode).json(Error.error);
    }

    Comment.findOneAndUpdate(
      { _id: req.params.commentId },
      { _id: req.params.commentId, content: req.body.content },
      (err, comment) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res
          .status(200)
          .json({ success: true, status: "Comment updated." });
      }
    );
  },
];

exports.delete = (req, res, next) => {
  Comment.findOneAndDelete({ _id: req.params.commentId }, (err, comment) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    return res.status(200).json({ success: true, comment });
  });
};

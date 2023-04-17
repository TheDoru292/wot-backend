const like = require("../models/like");
const ErrorHandler = require("../lib/ErrorHandler");
const async = require("async");
const user = require("../models/user");
const follow = require("../models/follow");

exports.likePost = (req, res, next) => {
  if (req.liked == true) {
    like.findOneAndDelete(
      { user: req.user._id, tweet: req.params.tweetId },
      (err, like) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res
          .status(200)
          .json({ success: true, success: "Removed like from tweet." });
      }
    );
  } else {
    like.create(
      { user: req.user._id, tweet: req.params.tweetId },
      (err, like) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res.status(200).json({ success: true, status: "Tweet liked." });
      }
    );
  }
};

exports.likeComment = (req, res, next) => {
  if (req.liked == true) {
    like.findOneAndDelete(
      { user: req.user._id, comment: req.params.commentId },
      (err, like) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res
          .status(200)
          .json({ success: true, status: "Removed like from comment." });
      }
    );
  } else {
    like.create(
      { user: req.user._id, comment: req.params.commentId },
      (err, like) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res
          .status(200)
          .json({ success: true, status: "Comment liked." });
      }
    );
  }
};

exports.getLikes = (req, res, next) => {
  like.find({ tweet: req.params.tweetId }, "user -_id").exec((err, likes) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    const array = [];

    async.each(
      likes,
      (document, callback) => {
        async.parallel(
          {
            user: function (cb) {
              user.findOne(
                { _id: document.user },
                "-password -_id",
                (err, user) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, user);
                }
              );
            },
            following: function (cb) {
              if (req.user) {
                follow.findOne(
                  { following: document.user, follower: req.user._id },
                  (err, follow) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, follow);
                  }
                );
              } else {
                cb(null, null);
              }
            },
          },
          (err, results) => {
            if (err) {
              const Error = new ErrorHandler(err, 500);
              return res.status(Error.errCode).json(Error.error);
            }

            array.push({
              user: results.user,
              following: results.following ? true : false,
            });

            callback();
          }
        );
      },
      (err) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res.json({
          success: true,
          likes: array,
        });
      }
    );
  });
};

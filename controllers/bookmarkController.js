const Bookmark = require("../models/bookmark");
const ErrorHandler = require("../lib/ErrorHandler");
const async = require("async");
const tweet = require("../models/tweet");
const like = require("../models/like");
const retweet = require("../models/retweet");
const bookmark = require("../models/bookmark");
const comment = require("../models/comment");

exports.get = (req, res, next) => {
  Bookmark.find({ user: req.user._id }, "tweet -_id", (err, bookmarks) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    const array = [];

    console.log(bookmarks);

    async.each(
      bookmarks,
      (document, callback) => {
        console.log(document);
        async.parallel(
          {
            tweet: function (cb) {
              tweet
                .findOne({ tweet: document.tweet })
                .populate("user", "-password")
                .exec((err, tweet) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, tweet);
                });
            },
            likes: function (cb) {
              like.countDocuments({ tweet: document.tweet }, (err, likes) => {
                if (err) {
                  cb(err);
                }

                cb(null, likes);
              });
            },
            like: function (cb) {
              like.findOne(
                { tweet: document.tweet, user: req.user._id },
                (err, like) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, like);
                }
              );
            },
            comments: function (cb) {
              comment.countDocuments(
                { tweet: document._id },
                (err, comments) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, comments);
                }
              );
            },
            retweets: function (cb) {
              retweet.countDocuments(
                { retweetedPost: document._id },
                (err, retweets) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, retweets);
                }
              );
            },
            retweet: function (cb) {
              retweet.findOne(
                { retweetedPost: document._id, user: req.user._id },
                (err, retweet) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, retweet);
                }
              );
            },
          },
          (err, results) => {
            if (err) {
              const Error = new ErrorHandler(err, 500);
              return res.status(Error.errCode).json(Error.error);
            }

            const obj = {
              tweet: results.tweet,
              likes: results.likes,
              liked: results.like == null ? false : true,
              comments: results.comments,
              retweets: results.retweets,
              retweeted: results.retweet == null ? false : true,
              bookmarked: true,
            };

            array.push(obj);

            callback();
          }
        );
      },
      (err) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res.json({ success: true, bookmarks: array });
      }
    );
  });
};

exports.post = (req, res, next) => {
  Bookmark.create(
    { user: req.user._id, tweet: req.params.tweetId },
    (err, bookmark) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, bookmark });
    }
  );
};

exports.delete = (req, res, next) => {
  Bookmark.findOneAndDelete(
    { user: req.user._id, tweet: req.params.tweetId },
    (err, bookmark) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res
        .status(200)
        .json({ success: true, status: "Bookmark deleted." });
    }
  );
};

exports.getAll = (req, res, next) => {
  Bookmark.find({ tweet: req.params.tweetId })
    .populate("user", "-password")
    .exec((err, bookmarks) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, bookmarks });
    });
};

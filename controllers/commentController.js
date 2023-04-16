const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../lib/ErrorHandler");
const notification = require("../models/notification");
const tweet = require("../models/tweet");
const async = require("async");
const like = require("../models/like");
const follow = require("../models/follow");
const retweet = require("../models/retweet");
const bookmark = require("../models/bookmark");

exports.getTweetAllComments = (req, res, next) => {
  Comment.find({ tweet: req.params.tweetId })
    .populate("user", "-password")
    .exec((err, comments) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      async.each(
        comments,
        (comment, callback) => {
          async.parallel(
            {
              likes: function (cb) {
                like.countDocuments({ comment: comment._id }, (err, likes) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, likes);
                });
              },
              like: function (cb) {
                like.findOne(
                  { user: req.user._id, comment: comment._id },
                  (err, like) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, like);
                  }
                );
              },
              follow: function (cb) {
                follow.findOne(
                  { following: comment.user, follower: req.user._id },
                  (err, follow) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, follow);
                  }
                );
              },
            },
            (err, results) => {
              if (err) {
                callback(err);
              }

              array.push({
                comment: comment,
                likes: { count: results.likes },
                like: results.like == null ? false : true,
                following: follow ? true : false,
              });

              callback();
            }
          );
        },
        (err) => {
          if (err) {
            const Erorr = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          return res.json({
            success: true,
            comments: array,
          });
        }
      );
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

exports.getUsersAllComments = (req, res, next) => {
  const { page = 1 } = req.query;

  Comment.paginate(
    { user: req.userId },
    {
      page,
      limit: 10,
      populate: {
        path: "user",
        select: "-password",
      },
    },
    (err, comments) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      let array = [];

      async.each(
        comments.docs,
        (comment, callback) => {
          async.parallel(
            {
              tweet: function (cb) {
                tweet
                  .findOne({ _id: comment.tweet })
                  .populate("user", "-password -bio -cover_url")
                  .exec((err, tweet) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, tweet);
                  });
              },
              tweetLikes: function (cb) {
                like.countDocuments({ tweet: comment.tweet }, (err, likes) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, likes);
                });
              },
              tweetLike: function (cb) {
                like.findOne(
                  { tweet: comment.tweet, user: req.user._id },
                  (err, like) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, like);
                  }
                );
              },
              tweetReplies: function (cb) {
                Comment.countDocuments(
                  { tweet: comment.tweet },
                  (err, comments) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, comments);
                  }
                );
              },
              tweetRetweets: function (cb) {
                retweet.countDocuments(
                  { retweetedPost: comment.tweet },
                  (err, retweets) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, retweets);
                  }
                );
              },
              tweetRetweet: function (cb) {
                retweet.findOne(
                  { user: req.user._id, retweetedPost: comment.tweet },
                  (err, retweet) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, retweet);
                  }
                );
              },
              tweetBookmark: function (cb) {
                bookmark.findOne(
                  { user: req.user._id, tweet: comment.tweet },
                  (err, bookmark) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, bookmark);
                  }
                );
              },
              replyLikes: function (cb) {
                like.countDocuments({ comment: comment._id }, (err, likes) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, likes);
                });
              },
              replyLike: function (cb) {
                like.findOne(
                  { comment: comment._id, user: req.user._id },
                  (err, like) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, like);
                  }
                );
              },
              replyFollow: function (cb) {
                follow.findOne(
                  { following: comment.user, follower: req.user._id },
                  (err, follow) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, follow);
                  }
                );
              },
            },
            (err, results) => {
              if (err) {
                callback(err);
              }

              follow.findOne(
                { following: results.tweet.user._id, follower: req.user._id },
                (err, follow) => {
                  if (err) {
                    callback(err);
                  }

                  array.push({
                    tweet: results.tweet,
                    comment: comment,
                    tweetStats: {
                      likes: results.tweetLikes,
                      liked: results.tweetLike ? true : false,
                      replies: results.tweetReplies,
                      retweets: results.tweetRetweets,
                      retweeted: results.tweetRetweet ? true : false,
                      bookmark: results.tweetBookmark ? true : false,
                      following: follow ? true : false,
                    },
                    commentStats: {
                      likes: results.replyLikes,
                      liked: results.replyLike ? true : false,
                      following: results.replyFollow ? true : false,
                    },
                  });

                  callback();
                }
              );
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
            comments: array,
            pages: {
              totalPages: comments.totalPages,
              page: comments.page,
              pagingCounter: comments.pagingCounter,
              hasPrevPage: comments.hasPrevPage,
              hasNextPage: comments.hasNextPage,
              prevPage: comments.prevPage,
              nextPage: comments.nextPage,
            },
          });
        }
      );
    }
  );
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

        console.log(comment);

        tweet.findOne({ _id: req.params.tweetId }, "user", (err, tweet) => {
          if (err) {
            console.log(err);
          }

          notification.create(
            {
              notificationUser: tweet.user,
              action: "comment",
              user: req.user._id,
              comment: comment._id,
            },
            (err, notif) => {
              if (err) {
                console.log(err);
              }

              console.log("notification created!");
            }
          );
        });
      }
    );
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

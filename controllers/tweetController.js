const { body, validationResult } = require("express-validator");
const Tweet = require("../models/tweet");
const async = require("async");
const ErrorHandler = require("../lib/ErrorHandler");
const like = require("../models/like");
const comment = require("../models/comment");
const tag = require("../models/tag");
const retweet = require("../models/retweet");
const bookmark = require("../models/bookmark");
const follow = require("../models/follow");

exports.get = (req, res) => {
  async.parallel(
    {
      tweet: function (cb) {
        Tweet.findOne({ _id: req.params.tweetId })
          .populate("user", "-password")
          .exec((err, tweet) => {
            if (err) {
              cb(err);
            }

            cb(null, tweet);
          });
      },
      likes: function (cb) {
        like.countDocuments({ tweet: req.params.tweetId }, (err, likes) => {
          if (err) {
            cb(err);
          }

          cb(null, likes);
        });
      },
      like: function (cb) {
        like.findOne(
          { tweet: req.params.tweetId, user: req.user._id },
          (err, like) => {
            if (err) {
              cb(err);
            }

            cb(null, like);
          }
        );
      },
      retweets: function (cb) {
        retweet.countDocuments(
          { retweetedPost: req.params.tweetId },
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
          { retweetedPost: req.params.tweetId, user: req.user._id },
          (err, retweet) => {
            if (err) {
              cb(err);
            }

            cb(null, retweet);
          }
        );
      },
      bookmarks: function (cb) {
        bookmark.countDocuments(
          { tweet: req.params.tweetId },
          (err, bookmarks) => {
            if (err) {
              cb(err);
            }

            cb(null, bookmarks);
          }
        );
      },
      bookmark: function (cb) {
        bookmark.findOne(
          { user: req.user._id, tweet: req.params.tweetId },
          (err, bookmark) => {
            if (err) {
              cb(err);
            }

            cb(null, bookmark);
          }
        );
      },
    },
    (err, results) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      follow.findOne(
        { following: results.tweet.user, follower: req.user._id },
        (err, follow) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          return res.status(200).json({
            success: true,
            tweet: results.tweet,
            likes: results.likes,
            liked: results.like == null ? false : true,
            retweets: results.retweets,
            retweeted: results.retweet == null ? false : true,
            bookmarked: results.bookmark == null ? false : true,
            bookmarks: results.bookmarks,
            following: follow ? true : false,
          });
        }
      );
    }
  );

  Tweet.findOne({ _id: req.params.tweetId })
    .populate("user", "-password")
    .exec((err, tweet) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      if (!tweet) {
        return res
          .status(404)
          .json({ success: false, status: "Post not found." });
      }
    });
};

exports.getAll = (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  console.log(req.query);

  Tweet.paginate({}, { page, limit, select: "_id" }, (err, tweets) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    const array = [];

    async.each(
      tweets.docs,
      (document, callback) => {
        async.parallel(
          {
            tweet: function (cb) {
              Tweet.findOne({ _id: document._id })
                .populate("user", "-password")
                .exec((err, tweet) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, tweet);
                });
            },
            likes: function (cb) {
              like.countDocuments({ tweet: document._id }, (err, likes) => {
                if (err) {
                  cb(err);
                }

                cb(null, likes);
              });
            },
            like: function (cb) {
              like.findOne(
                { tweet: document._id, user: req.user._id },
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
            bookmark: function (cb) {
              bookmark.findOne(
                { user: req.user._id, tweet: document._id },
                (err, bookmark) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, bookmark);
                }
              );
            },
          },
          (err, results) => {
            if (err) {
              const Error = new ErrorHandler(err, 500);
              return res.status(Error.errCode).json(Error.error);
            }

            follow.findOne(
              { following: results.tweet.user, follower: req.user._id },
              (err, follow) => {
                if (err) {
                  const Error = new ErrorHandler(err, 500);
                  return res.status(Error.errCode).json(Error.error);
                }

                const obj = {
                  tweet: results.tweet,
                  likes: {
                    count: results.likes,
                  },
                  liked: results.like == null ? false : true,
                  comments: {
                    count: results.comments,
                  },
                  retweets: {
                    count: results.retweets,
                  },
                  retweeted: results.retweet == null ? false : true,
                  bookmarked: results.bookmark == null ? false : true,
                  following: follow ? true : false,
                };

                array.push(obj);
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
          tweets: array,
          pages: {
            totalPages: tweets.totalPages,
            page: tweets.page,
            pagingCounter: tweets.pagingCounter,
            hasPrevPage: tweets.hasPrevPage,
            hasNextPage: tweets.hasNextPage,
            prevPage: tweets.prevPage,
            nextPage: tweets.nextPage,
          },
        });
      }
    );
  });
};

exports.getAllUserTweets = (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  Tweet.paginate(
    { user: req.userId },
    { page, limit, select: "_id" },
    (err, tweets) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      async.each(
        tweets.docs,
        (document, callback) => {
          async.parallel(
            {
              tweet: function (cb) {
                Tweet.findOne({ _id: document._id })
                  .populate("user", "-password")
                  .exec((err, tweet) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, tweet);
                  });
              },
              likes: function (cb) {
                like.countDocuments({ tweet: document._id }, (err, likes) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, likes);
                });
              },
              like: function (cb) {
                like.findOne(
                  { tweet: document._id, user: req.user._id },
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
                retweet.find(
                  { retweetedPost: document._id, user: req.user._id },
                  (err, retweet) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, retweet);
                  }
                );
              },
              bookmark: function (cb) {
                bookmark.findOne(
                  { user: req.user._id, tweet: document._id },
                  (err, bookmark) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, bookmark);
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
                likes: {
                  count: results.likes,
                },
                liked: results.like == null ? false : true,
                comments: {
                  count: results.comments,
                },
                retweets: {
                  count: results.retweets,
                },
                retweeted: results.retweet == null ? false : true,
                bookmarked: results.bookmark == null ? false : true,
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
          return res.json({
            success: true,
            tweets: array,
            pages: {
              totalPages: tweets.totalPages,
              page: tweets.page,
              pagingCounter: tweets.pagingCounter,
              hasPrevPage: tweets.hasPrevPage,
              hasNextPage: tweets.hasNextPage,
              prevPage: tweets.prevPage,
              nextPage: tweets.nextPage,
            },
          });
        }
      );
    }
  );
};

exports.post = [
  body("content").isLength({ min: 3, max: 280 }),

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

    Tweet.create(
      { user: req.user._id, content: req.body.content, posted_on: new Date() },
      (err, tweet) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        setTimeout(() => {
          const regex = /#[A-Za-z]+/g;

          let array = req.body.content.match(regex);

          async.forEach(array, (document, callback) => {
            tag.create({ tweet: tweet._id, tag: document }, (err, tag) => {
              if (err) {
                console.log(err);
              }

              console.log("tag added to database:", document);
            });
          });
        }, 1000);

        return res.status(200).json({ success: true, tweet });
      }
    );
  },
];

exports.edit = [
  body("content").isLength({ min: 3, max: 280 }),

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

    Tweet.findOneAndUpdate(
      { _id: req.params.tweetId },
      { content: req.body.content, _id: req.params.tweetId },
      (err, tweet) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res
          .status(200)
          .json({ success: true, status: "Tweet updated." });
      }
    );
  },
];

exports.delete = (req, res, next) => {
  Tweet.findOneAndDelete({ _id: req.params.tweetId }, (err, tweet) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    return res.status(200).json({ success: true, status: "Tweet deleted." });
  });
};

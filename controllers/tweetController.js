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
const mongoose = require("mongoose");
const notification = require("../models/notification");

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
        if (req.user) {
          like.findOne(
            { tweet: req.params.tweetId, user: req.user._id },
            (err, like) => {
              if (err) {
                cb(err);
              }

              cb(null, like);
            }
          );
        } else {
          cb(null, null);
        }
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
        if (req.user) {
          retweet.findOne(
            { retweetedPost: req.params.tweetId, user: req.user._id },
            (err, retweet) => {
              if (err) {
                cb(err);
              }

              cb(null, retweet);
            }
          );
        } else {
          cb(null, null);
        }
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
        if (req.user) {
          bookmark.findOne(
            { user: req.user._id, tweet: req.params.tweetId },
            (err, bookmark) => {
              if (err) {
                cb(err);
              }

              cb(null, bookmark);
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

      if (req.user) {
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
      } else {
        return res.json({
          success: true,
          tweet: results.tweet,
          likes: results.likes,
          retweets: results.retweets,
          bookmarks: results.bookmarks,
        });
      }
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
              if (req.user) {
                like.findOne(
                  { tweet: document._id, user: req.user._id },
                  (err, like) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, like);
                  }
                );
              } else {
                cb(null, null);
              }
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
              if (req.user) {
                retweet.findOne(
                  { retweetedPost: document._id, user: req.user._id },
                  (err, retweet) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, retweet);
                  }
                );
              } else {
                cb(null, null);
              }
            },
            bookmark: function (cb) {
              if (req.user) {
                bookmark.findOne(
                  { user: req.user._id, tweet: document._id },
                  (err, bookmark) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, bookmark);
                  }
                );
              } else {
                cb(null, null);
              }
            },
          },
          (err, results) => {
            if (err) {
              callback(err);
            }

            if (req.user) {
              follow.findOne(
                { following: results.tweet.user, follower: req.user._id },
                (err, follow) => {
                  if (err) {
                    callback(err);
                  }

                  const obj = {
                    tweet: results.tweet,
                    likes: results.likes,
                    liked: results.like == null ? false : true,
                    comments: results.comments,
                    retweets: results.retweets,
                    retweeted: results.retweet == null ? false : true,
                    bookmarked: results.bookmark == null ? false : true,
                    following: follow ? true : false,
                  };

                  array.push(obj);
                  callback();
                }
              );
            } else {
              array.push({
                tweet: results.tweet,
                likes: results.likes,
                comments: results.comments,
                retweets: results.retweets,
              });
              callback();
            }
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
                if (req.user) {
                  like.findOne(
                    { tweet: document._id, user: req.user._id },
                    (err, like) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, like);
                    }
                  );
                } else {
                  cb(null, null);
                }
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
                if (req.user) {
                  retweet.find(
                    { retweetedPost: document._id, user: req.user._id },
                    (err, retweet) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, retweet);
                    }
                  );
                } else {
                  cb(null, null);
                }
              },
              bookmark: function (cb) {
                if (req.user) {
                  bookmark.findOne(
                    { user: req.user._id, tweet: document._id },
                    (err, bookmark) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, bookmark);
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

              const obj = {
                tweet: results.tweet,
                likes: results.likes,
                liked: results.like == null ? false : true,
                comments: results.comments,
                retweets: results.retweets,
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
  body("content").trim(),

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

    const tweetObj = {
      user: req.user._id,
      content: req.body.content,
      posted_on: new Date(),
      giphyUrl: req.body.giphyUrl || null,
    };

    Tweet.create(tweetObj, (err, tweet) => {
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
    });
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

exports.delete = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Tweet.findOneAndDelete({ _id: req.params.tweetId }, { session });
    await bookmark.deleteMany({ tweet: req.params.tweetId }, { session });
    await comment.deleteMany({ tweet: req.params.tweetId }, { session });
    await like.deleteMany({ tweet: req.params.tweetId }, { session });
    await retweet.deleteMany(
      { retweetedPost: req.params.tweetId },
      { session }
    );
    await tag.deleteMany({ tweet: req.params.tweetId }, { session });
    await session.commitTransaction();
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, status: "Deleting tweet failed." })
      .end();
    await session.abortTransaction();
  } finally {
    res.status(200).json({ success: true, status: "Deleted tweet." }).end();
    session.endSession();
  }
};

exports.getFollowingTweets = (req, res, next) => {
  const { page = 1 } = req.query;

  follow.find(
    { follower: req.user._id },
    "following -_id",
    (err, following) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      following.map((item) => {
        array.push(item.following.toString());
      });

      Tweet.paginate(
        { user: { $in: array } },
        {
          page,
          limit: 10,
          select: "_id",
        },
        (err, tweets) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          const array = [];

          async.each(
            tweets.docs,
            (tweet, callback) => {
              async.parallel(
                {
                  tweet: function (cb) {
                    Tweet.findOne({ _id: tweet._id })
                      .populate("user", "-password")
                      .exec((err, tweet) => {
                        if (err) {
                          cb(err);
                        }

                        cb(null, tweet);
                      });
                  },
                  likes: function (cb) {
                    like.countDocuments({ tweet: tweet._id }, (err, likes) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, likes);
                    });
                  },
                  like: function (cb) {
                    like.findOne(
                      { tweet: tweet._id, user: req.user._id },
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
                      { tweet: tweet._id },
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
                      { retweetedPost: tweet._id },
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
                      { retweetedPost: tweet._id, user: req.user._id },
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
                      { user: req.user._id, tweet: tweet._id },
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
                        likes: results.likes,
                        liked: results.like == null ? false : true,
                        comments: results.comments,
                        retweets: results.retweets,
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
        }
      );
    }
  );
};

exports.getUserLikedTweets = (req, res, next) => {
  const { page = 1 } = req.query;

  like.paginate(
    { user: req.userId, tweet: { $exists: true } },
    { page, limit: 10 },
    (err, likedTweets) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      async.each(
        likedTweets.docs,
        (document, callback) => {
          async.parallel(
            {
              tweet: function (cb) {
                Tweet.findOne({ _id: document.tweet })
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
                if (req.user) {
                  like.findOne(
                    { tweet: document.tweet, user: req.user._id },
                    (err, like) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, like);
                    }
                  );
                } else {
                  cb(null, null);
                }
              },
              comments: function (cb) {
                comment.countDocuments(
                  { tweet: document.tweet },
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
                  { retweetedPost: document.tweet },
                  (err, retweets) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, retweets);
                  }
                );
              },
              retweet: function (cb) {
                if (req.user) {
                  retweet.findOne(
                    { retweetedPost: document.tweet, user: req.user._id },
                    (err, retweet) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, retweet);
                    }
                  );
                } else {
                  cb(null, null);
                }
              },
              bookmark: function (cb) {
                if (req.user) {
                  bookmark.findOne(
                    { user: req.user._id, tweet: document.tweet },
                    (err, bookmark) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, bookmark);
                    }
                  );
                } else {
                  cb(null, null);
                }
              },
            },
            (err, results) => {
              if (err) {
                callback(err);
              }

              if (req.user) {
                follow.findOne(
                  { following: results.tweet.user, follower: req.user._id },
                  (err, follow) => {
                    if (err) {
                      callback(err);
                    }

                    const obj = {
                      tweet: results.tweet,
                      likes: results.likes,
                      liked: results.like == null ? false : true,
                      comments: results.comments,
                      retweets: results.retweets,
                      retweeted: results.retweet == null ? false : true,
                      bookmarked: results.bookmark == null ? false : true,
                      following: follow ? true : false,
                    };

                    array.push(obj);
                    callback();
                  }
                );
              } else {
                array.push({
                  tweet: results.tweet,
                  likes: results.likes,
                  comments: results.comments,
                  retweets: results.retweets,
                });
                callback();
              }
            }
          );
        },
        (err) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          return res.status(200).json({
            success: true,
            tweets: array,
            pages: {
              totalPages: likedTweets.totalPages,
              page: likedTweets.page,
              pagingCounter: likedTweets.pagingCounter,
              hasPrevPage: likedTweets.hasPrevPage,
              hasNextPage: likedTweets.hasNextPage,
              prevPage: likedTweets.prevPage,
              nextPage: likedTweets.nextPage,
            },
          });
        }
      );
    }
  );
};

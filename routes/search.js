const express = require("express");
const router = express.Router();

const passport = require("passport");
const async = require("async");
const Tweet = require("../models/tweet");
const Comment = require("../models/comment");
const Like = require("../models/like");
const Retweet = require("../models/retweet");
const Follow = require("../models/follow");
const Bookmark = require("../models/bookmark");
const User = require("../models/user");
require("../passport");

router.get(
  "/search",
  passport.authenticate(["jwt", "anonymous"], { session: false }),
  (req, res, next) => {
    const { q, f } = req.query;

    if (!f) {
      Tweet.aggregate(
        [
          {
            $search: {
              index: "Tweets",
              text: {
                query: q,
                path: {
                  wildcard: "*",
                },
              },
            },
          },
        ],
        "_id",
        (err, tweets) => {
          if (err) {
            next(err);
          }

          const array = [];

          async.each(
            tweets,
            (tweet, callback) => {
              async.parallel(
                {
                  tweet: function (cb) {
                    Tweet.findOne({ _id: tweet._id })
                      .populate("user", "-password -bio")
                      .exec((err, tweet) => {
                        if (err) {
                          cb(err);
                        }

                        cb(null, tweet);
                      });
                  },
                  comments: function (cb) {
                    Comment.countDocuments(
                      { tweet: tweet._id },
                      (err, comments) => {
                        if (err) {
                          cb(err);
                        }

                        cb(null, comments);
                      }
                    );
                  },
                  likes: function (cb) {
                    Like.countDocuments({ tweet: tweet._id }, (err, likes) => {
                      if (err) {
                        cb(err);
                      }

                      cb(null, likes);
                    });
                  },
                  like: function (cb) {
                    if (req.user) {
                      Like.findOne(
                        { tweet: tweet._id, user: req.user._id },
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
                    Retweet.countDocuments(
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
                    if (req.user) {
                      Retweet.findOne(
                        { retweetedPost: tweet._id, user: req.user._id },
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
                  bookmarked: function (cb) {
                    if (req.user) {
                      Bookmark.findOne(
                        { tweet: tweet._id, user: req.user },
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

                  console.log("hi");

                  if (req.user) {
                    Follow.findOne(
                      { following: results.tweet.user, follower: req.user._id },
                      (err, follow) => {
                        if (err) {
                          callback(err);
                        }

                        array.push({
                          tweet: results.tweet,
                          likes: results.likes,
                          liked: results.like ? true : false,
                          comments: results.comments,
                          retweets: results.retweets,
                          retweeted: results.retweet ? true : false,
                          bookmarked: results.bookmarked ? true : false,
                          following: follow ? true : false,
                        });
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
                next(err);
              }

              return res.json({
                success: true,
                tweets: array,
              });
            }
          );
        }
      );
    } else {
      if (f == "user") {
        let handleSearch = false;

        const usernameSearch = {
          $search: {
            index: "default",
            autocomplete: {
              query: q,
              path: "username",
            },
          },
        };

        const handleSearchSettings = {
          $search: {
            index: "default",
            autocomplete: {
              query: q,
              path: "handle",
            },
          },
        };

        if (q[0] == "@") {
          handleSearch = true;
        }

        User.aggregate(
          [handleSearch == true ? handleSearchSettings : usernameSearch],
          (err, users) => {
            if (err) {
              next(err);
            }

            const array = [];

            if (req.user) {
              async.each(
                users,
                (user, callback) => {
                  Follow.findOne(
                    { follower: req.user._id, following: user._id },
                    (err, follow) => {
                      if (err) {
                        callback(err);
                      }

                      array.push({ user, following: follow ? true : false });
                      callback();
                    }
                  );
                },
                (err) => {
                  if (err) {
                    next(err);
                  }

                  return res.json({ success: true, users: array });
                }
              );
            } else {
              return res.json({ success: true, users });
            }
          }
        );
      }
    }
  }
);

module.exports = router;

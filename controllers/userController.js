const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../lib/ErrorHandler");
const bcrpyt = require("bcryptjs");
const async = require("async");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const user = require("../models/user");
const tweet = require("../models/tweet");
const like = require("../models/like");
const reply = require("../models/comment");
const follow = require("../models/follow");

exports.getAll = (req, res, next) => {
  User.find({}, "handle -_id", (err, users) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    return res.status(200).json({ success: true, users });
  });
};

exports.register = [
  body("username").isLength({ min: 3, max: 255 }).trim().escape(),
  body("handle").isLength({ min: 3, max: 45 }).trim(),
  body("password", "Password should be at least 8 characters long!")
    .isLength({ min: 8 })
    .trim(),
  body("profile_picture_url").trim(),
  body("cover_url").trim(),
  body("bio").trim().escape(),

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

    const userObj = {
      username: req.body.username,
      handle: req.body.handle,
      password: bcrpyt.hashSync(req.body.password, 10),
      registered_on: new Date(),
      profile_picture_url:
        req.body.profile_picture_url || process.env.DEFAULT_PFP_LINK,
      cover_url: req.body.cover_url || null,
      bio: req.body.bio || "",
    };

    User.create(userObj)
      .then((user) => {
        console.log(user);

        const userObj = {
          _id: user._id,
          username: user.username,
          handle: user.username,
          registered_on: user.registered_on,
          profile_picture_url: user.profile_picture_url,
          verifiedCheckmark: user.verifiedCheckmark,
          cover_url: user.cover_url,
          bio: user.bio,
        };

        jwt.sign({ _id: user._id }, process.env.JWT_SECRET, (err, token) => {
          if (err) {
            return res.status(500).json({
              success: false,
              status: "Something went wrong. Please log in.",
            });
          }

          res.cookie("token", token, { maxAge: 60 * 60 * 60 * 60 * 100 });
          return res.status(200).json({ success: true, user: userObj, token });
        });
      })
      .catch((err) => {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      });
  },
];

exports.editProfile = [
  body("profile_picture_url").trim(),
  body("username").isLength({ min: 3, max: 255 }).trim().escape(),
  body("cover_link").trim(),
  body("bio").trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    console.log("body", req.body);

    if (!errors.isEmpty()) {
      const Error = new ErrorHandler(
        null,
        400,
        "Check errors array",
        errors.array()
      );
      return res.status(Error.errCode).json(Error.error);
    }

    const userObj = {
      _id: req.user._id,
      username: req.body.username,
      profile_picture_url: req.body.profile_picture_url,
      cover_url: req.body.cover_url || null,
      bio: req.body.bio || "",
    };

    User.findOneAndUpdate({ _id: req.user._id }, userObj, (err, user) => {
      if (err) {
        const Error = new ErrorHandler(err);
        return res.status(Error.errCode).json(Error.error);
      }

      user.password = null;

      console.log(user);

      return res
        .status(200)
        .json({ success: true, status: "User updated.", user: user });
    });
  },
];

exports.getProfile = (req, res, next) => {
  async.parallel(
    {
      profile: function (cb) {
        user.findOne(
          { _id: req.userId },
          "username handle profile_picture_url bio verifiedCheckmark registered_on cover_url",
          (err, user) => {
            if (err) {
              cb(err);
            }

            cb(null, user);
          }
        );
      },
      following: function (cb) {
        follow.countDocuments({ follower: req.userId }, (err, following) => {
          if (err) {
            cb(err);
          }

          cb(null, following);
        });
      },
      followers: function (cb) {
        follow.countDocuments({ following: req.userId }, (err, followers) => {
          if (err) {
            cb(err);
          }

          cb(null, followers);
        });
      },
      tweets: function (cb) {
        tweet.countDocuments({ user: req.userId }, (err, tweets) => {
          if (err) {
            cb(err);
          }

          cb(null, tweets);
        });
      },
      replies: function (cb) {
        reply.countDocuments({ user: req.userId }, (err, replies) => {
          if (err) {
            cb(err);
          }

          cb(null, replies);
        });
      },
      likes: function (cb) {
        like.countDocuments({ user: req.userId }, (err, likes) => {
          if (err) {
            cb(err);
          }

          cb(null, likes);
        });
      },
      userFollowing: function (cb) {
        if (req.user) {
          follow.findOne(
            { following: req.userId, follower: req.user._id },
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

      return res.status(200).json({
        success: true,
        user: results.profile,
        following: results.following,
        followers: results.followers,
        reqUserFollowing: results.userFollowing ? true : false,
        tweets: results.tweets,
        likes: results.likes,
        replies: results.replies,
      });
    }
  );
};

exports.connect = (req, res, next) => {
  User.find({}, "-password", (err, users) => {
    if (err) {
      const Error = new ErrorHandler(err, 500);
      return res.status(Error.errCode).json(Error.error);
    }

    const array = [];

    if (req.header("limit")) {
      let counter = 0;
      let index = 0;

      async.until(
        (cb) => {
          return cb(null, counter >= 3);
        },
        (cb) => {
          if (index >= users.length) {
            counter = 3;
            cb();
          } else {
            follow.findOne(
              { following: users[index]._id, follower: req.user._id },
              (err, follow) => {
                if (err) {
                  cb(err);
                }

                if (users[index].handle != req.params.userHandle && !follow) {
                  array.push({ user: users[index], following: false });
                  counter++;
                }

                index++;
                cb();
              }
            );
          }
        },
        (err) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errorCode).json(Error.error);
          }

          return res.status(200).json({ success: true, users: array });
        }
      );
    } else {
      async.each(
        users,
        (user, callback) => {
          follow.findOne(
            { following: user._id, follower: req.user._id },
            (err, follow) => {
              if (err) {
                callback(err);
              }

              if (user.handle != req.params.userHandle && !follow) {
                array.push({ user, following: false });
              }

              callback();
            }
          );
        },
        (err) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errorCode).json(Error.error);
          }

          return res.status(200).json({ success: true, users: array });
        }
      );
    }
  });
};

const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../lib/ErrorHandler");
const bcrpyt = require("bcryptjs");
const async = require("async");

const User = require("../models/user");
const user = require("../models/user");
const tweet = require("../models/tweet");
const like = require("../models/like");
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

    console.log(errors);

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

        return res
          .status(200)
          .json({ success: true, status: "You can now log in!" });
      })
      .catch((err) => {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      });
  },
];

exports.getProfile = (req, res, next) => {
  async.parallel(
    {
      profile: function (cb) {
        user.findOne(
          { _id: req.userId },
          "username handle profile_picture_url bio verifiedCheckmark registered_on",
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
      userFollowing: function (cb) {
        follow.findOne(
          { following: req.userId, follower: req.user._id },
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
      });
    }
  );
};

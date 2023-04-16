const Follow = require("../models/follow");
const ErrorHandler = require("../lib/ErrorHandler");
const Notification = require("../models/notification");
const async = require("async");

exports.follow = (req, res, next) => {
  Follow.create(
    {
      follower: req.user._id,
      following: req.userId,
      following_since: new Date(),
    },
    (err, follow) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      res.status(200).json({ success: true, follow }).end();
    }
  );

  Notification.create(
    { notificationUser: req.userId, user: req.user._id, action: "follow" },
    (err, notification) => {
      if (err) {
        console.log(err);
      }

      console.log("notification created");
    }
  );
};

exports.deleteFollow = (req, res, next) => {
  Follow.deleteOne(
    { follower: req.user._id, following: req.userId },
    (err, follow) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, follow });
    }
  );
};

exports.getFollowers = (req, res, next) => {
  Follow.find({ following: req.userId })
    .populate("follower", "-password")
    .exec((err, followers) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      async.each(
        followers,
        (follower, callback) => {
          console.log(follower);
          console.log(follower.follower._id);

          Follow.findOne(
            { following: follower.follower._id, follower: req.user._id },
            (err, follow) => {
              if (err) {
                callback(err);
              }

              array.push({ user: follower, following: follow ? true : false });
              callback();
            }
          );
        },
        (err) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          return res.status(200).json({ success: true, followers: array });
        }
      );
    });
};

exports.getFollowing = (req, res, next) => {
  Follow.find({ follower: req.userId })
    .populate("following", "-password")
    .exec((err, following) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      async.each(
        following,
        (follower, callback) => {
          const { id } = follower.following;

          Follow.findOne(
            { following: id, follower: req.user._id },
            (err, follow) => {
              if (err) {
                callback(err);
              }

              array.push({ user: follower, following: follow ? true : false });
              callback();
            }
          );
        },
        (err) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          return res.status(200).json({ success: true, following: array });
        }
      );
    });
};

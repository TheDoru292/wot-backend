const Follow = require("../models/follow");
const ErrorHandler = require("../lib/ErrorHandler");
const Notification = require("../models/notification");

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
    .populate(
      "follower",
      "username handle profile_picture_url verifiedCheckmark bio"
    )
    .exec((err, followers) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, followers });
    });
};

exports.getFollowing = (req, res, next) => {
  Follow.find({ follower: req.userId })
    .populate(
      "following",
      "username handle profile_picture_url verifiedCheckmark bio"
    )
    .exec((err, following) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, following });
    });
};

const Notification = require("../models/notification");
const ErrorHandler = require("../lib/ErrorHandler");
const async = require("async");

exports.get = (req, res, next) => {
  console.log(req.user);
  console.log(req.query.user);

  Notification.find({ notificationUser: req.user._id })
    .populate("tweet")
    .populate("user", "-password")
    .exec((err, notifications) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, notifications });
    });
};

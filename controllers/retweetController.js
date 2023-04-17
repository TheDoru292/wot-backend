const ErrorHandler = require("../lib/ErrorHandler");
const Retweet = require("../models/retweet");
const user = require("../models/user");
const follow = require("../models/follow");
const async = require("async");

exports.getRetweets = (req, res, next) => {
  Retweet.find({ retweetedPost: req.params.tweetId }, "user -_id").exec(
    (err, retweets) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      const array = [];

      async.each(
        retweets,
        (document, callback) => {
          async.parallel(
            {
              user: function (cb) {
                user.findOne(
                  { _id: document.user },
                  "-password -_id",
                  (err, user) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, user);
                  }
                );
              },
              following: function (cb) {
                if (req.user) {
                  follow.findOne(
                    { following: document.user, follower: req.user._id },
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

              array.push({
                user: results.user,
                following: results.following ? true : false,
              });

              callback();
            }
          );
        },
        (err) => {
          if (err) {
            const Error = new ErrorHandler(err, 500);
            return res.status(Error.errCode).json(Error.error);
          }

          return res.json({ success: true, retweets: array });
        }
      );
    }
  );
};

exports.postRetweet = (req, res, next) => {
  console.log(req.retweeted);

  if (req.retweeted === false) {
    Retweet.create(
      { user: req.user._id, retweet: true, retweetedPost: req.params.tweetId },
      (err, retweet) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res.status(200).json({ success: true, retweet });
      }
    );
  } else {
    Retweet.findOneAndDelete(
      { user: req.user._id, retweetedPost: req.params.tweetId },
      (err, retweet) => {
        if (err) {
          const Error = new ErrorHandler(err, 500);
          return res.status(Error.errCode).json(Error.error);
        }

        return res.status(200).json({ success: true, status: "Retweet undid" });
      }
    );
  }
};

const Conversation = require("../models/conversation");
const User = require("../models/user");
const Message = require("../models/message");
const async = require("async");

exports.getUserConversations = (req, res, next) => {
  Conversation.find({ users: { $in: req.userId } }).exec(
    (err, conversations) => {
      if (err) {
        next(err);
      }

      const array = [];

      async.each(
        conversations,
        (conversation, callback) => {
          async.parallel(
            {
              firstUser: (cb) => {
                User.findOne(
                  { _id: conversation.users[0] },
                  "-password -bio -cover_url -registered_on -verified -bio",
                  (err, user) => {
                    if (err) {
                      cb(err);
                    }
                    cb(null, user);
                  }
                );
              },
              secondUser: (cb) => {
                User.findOne(
                  { _id: conversation.users[1] },
                  "-password -bio -cover_url -registered_on -verified -bio",
                  (err, user) => {
                    if (err) {
                      cb(err);
                    }

                    cb(null, user);
                  }
                );
              },
              latestMessage: (cb) => {
                Message.findOne({ conversation: conversation._id })
                  .sort({ timestamp: -1 })
                  .exec((err, message) => {
                    if (err) {
                      cb(err);
                    }

                    let editedMessage = message;

                    if (message.deleted) {
                      editedMessage.message = "";
                    }

                    cb(null, editedMessage);
                  });
              },
            },
            (err, results) => {
              if (err) {
                callback(err);
              }

              array.push({
                users: [results.firstUser, results.secondUser],
                latestMessage: results.latestMessage,
              });
              callback();
            }
          );
        },
        (err) => {
          if (err) {
            next(err);
          }

          return res.json({ success: true, conversations: array });
        }
      );
    }
  );
};

exports.startConversation = (req, res, next) => {
  Conversation.create(
    { users: [req.user._id, req.userId] },
    (err, conversation) => {
      if (err) {
        next(err);
      }

      return res.json({ success: true, status: "Conversation started." });
    }
  );
};

exports.getDetails = (req, res, next) => {
  Conversation.findOne(
    { _id: req.params.conversationId },
    (err, conversation) => {
      if (err) {
        next(err);
      }

      if (conversation) {
        let index = conversation.users.indexOf(req.user._id);
        conversation.users.splice(index, 1);

        async.parallel(
          {
            user: function (cb) {
              User.findOne(
                { _id: conversation.users[0] },
                "-password -bio -cover_url",
                (err, user) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, user);
                }
              );
            },
            messages: function (cb) {
              Message.countDocuments(
                { conversation: conversation._id },
                (err, messages) => {
                  if (err) {
                    cb(err);
                  }

                  cb(null, messages);
                }
              );
            },
          },
          (err, results) => {
            if (err) {
              next(err);
            }

            return res.json({
              success: true,
              conversation: { user: results.user, messages: results.messages },
            });
          }
        );
      }
    }
  );
};

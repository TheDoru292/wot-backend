const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const user = require("../models/user");
const ObjectId = require("mongoose").Types.ObjectId;

exports.getMessages = (req, res, next) => {
  const { page = 1, limit = 999 } = req.query;

  const myAggregate = Message.aggregate([
    [
      {
        $match: { conversation: ObjectId(req.params.conversationId) },
      },
      {
        $project: {
          user: 1,
          conversation: 1,
          deleted: 1,
          timestamp: 1,
          message: {
            $cond: {
              if: {
                $eq: ["$deleted", true],
              },
              then: "",
              else: "$message",
            },
          },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
    ],
  ]);
  Message.aggregatePaginate(
    myAggregate,
    {
      page,
      limit,
      populate: {
        path: user,
        select: "-password -bio -cover_url -registered_on -verified -bio",
      },
    },
    (err, messages) => {
      if (err) {
        next(err);
      }

      return res.json({ success: true, messages });
    }
  );
};

exports.sendMessage = [
  body("message").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    console.log(req.body);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: "Check errors array",
        errors: errors.array(),
      });
    }

    Message.create(
      {
        conversation: req.params.conversationId,
        user: req.user._id,
        message: req.body.message,
        timestamp: new Date(),
      },
      (err, message) => {
        if (err) {
          next(err);
        }

        return res.json({ success: true, status: "Message sent.", message });
      }
    );
  },
];

exports.deleteMessage = (req, res, next) => {
  Message.findOneAndUpdate(
    { _id: req.params.messageId },
    { _id: req.params.messageId, deleted: true },
    (err, message) => {
      if (err) {
        next(err);
      }

      return res.json({ success: true, status: "Message deleted." });
    }
  );
};

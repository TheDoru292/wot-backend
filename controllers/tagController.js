const tag = require("../models/tag");
const ErrorHandler = require("../lib/ErrorHandler");

exports.getPopular = (req, res, next) => {
  tag.aggregate(
    [
      {
        $group: { _id: "$tag", number: { $sum: 1 } },
      },
      {
        $sort: { number: -1 },
      },
      {
        $limit: 5,
      },
    ],
    {},
    (err, tags) => {
      if (err) {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      }

      return res.status(200).json({ success: true, tags });
    }
  );
};

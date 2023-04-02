const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
  comment: { type: Schema.Types.ObjectId, ref: "Comment" },
});

module.exports = mongoose.model("Like", LikeSchema);

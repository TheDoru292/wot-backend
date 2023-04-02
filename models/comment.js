const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet", required: true },
  content: { type: String, required: true },
  posted_on: { type: Date, required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);

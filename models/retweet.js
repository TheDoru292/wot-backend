const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RetweetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  retweetedPost: { type: Schema.Types.ObjectId, ref: "Tweet" },
});

module.exports = mongoose.model("Retweet", RetweetSchema);

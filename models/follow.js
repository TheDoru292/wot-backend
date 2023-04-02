const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
  following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following_since: { type: Date, required: true },
});

module.exports = mongoose.model("Follow", FollowSchema);

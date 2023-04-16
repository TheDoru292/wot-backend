const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
  comment: { type: Schema.Types.ObjectId, ref: "Comment" },
});

LikeSchema.plugin(paginate);

module.exports = mongoose.model("Like", LikeSchema);

const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet", required: true },
  content: { type: String, required: true },
  posted_on: { type: Date, required: true },
});

CommentSchema.plugin(paginate);

module.exports = mongoose.model("Comment", CommentSchema);

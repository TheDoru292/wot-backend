const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: String,
  posted_on: Date,
  giphyUrl: String,
});

TweetSchema.plugin(paginate);

module.exports = mongoose.model("Tweet", TweetSchema);

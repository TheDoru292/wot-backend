const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
});

module.exports = mongoose.model("Bookmark", BookmarkSchema);

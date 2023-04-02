const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
  tag: { type: String },
});

module.exports = mongoose.model("Tag", TagSchema);

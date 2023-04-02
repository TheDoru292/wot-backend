const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  user_one: { type: Schema.Types.ObjectId, ref: "User" },
  user_two: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Conversation", ConversationSchema);

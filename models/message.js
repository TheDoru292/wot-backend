const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String },
  messaged_on: { type: Date },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Message", MessageSchema);

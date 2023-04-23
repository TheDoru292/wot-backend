const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  users: Array,
});

module.exports = mongoose.model("Conversation", ConversationSchema);

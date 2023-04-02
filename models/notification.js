const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  notificationUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
  date: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Notification", NotificationSchema);

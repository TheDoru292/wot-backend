const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  handle: { type: String, required: true },
  password: { type: String, required: true },
  registered_on: { type: Date, required: true },
  profile_picture_url: { type: String, required: true },
  verified: { type: Boolean, required: true },
  bio: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
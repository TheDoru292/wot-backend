const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  handle: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String, required: true },
  registered_on: { type: Date, required: true },
  profile_picture_url: { type: String },
  cover_url: { type: String },
  verifiedCheckmark: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  bio: { type: String },
});

module.exports = mongoose.model("User", UserSchema);

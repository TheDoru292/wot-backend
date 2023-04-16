const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const ErrorHandler = require("../lib/ErrorHandler");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      const Error = new ErrorHandler(err, 400);
      console.log(user);
      return res.status(Error.errCode).json(Error.error);
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const userObj = {
        _id: user._id,
        username: user.username,
        handle: user.handle,
        registered_on: user.registered_on,
        profile_picture_url: user.profile_picture_url,
        verifiedCheckmark: user.verifiedCheckmark,
        cover_url: user.cover_url || "",
        bio: user.bio,
      };

      jwt.sign({ _id: user._id }, process.env.JWT_SECRET, (err, token) => {
        res.cookie("token", token, { maxAge: 60 * 60 * 60 * 60 * 100 });
        return res.json({ success: true, user: userObj, token });
      });
    });
  })(req, res);
});

module.exports = router;

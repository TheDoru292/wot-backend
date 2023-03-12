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
        bio: user.bio,
      };

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, userObj, token });
    });
  })(req, res);
});

module.exports = router;

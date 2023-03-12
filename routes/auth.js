const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const ErrorHandler = require("../lib/ErrorHandler");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      const Error = new ErrorHandler(err, 400);
      return res.status(Error.errCode).json(Error.error);
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign(user, process.env.JWT_SECRET);
      return res.json({ success: true, user, token });
    });
  })(req, res);
});

module.exports = router;

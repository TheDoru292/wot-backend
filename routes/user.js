const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../lib/ErrorHandler");
const bcrpyt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/user");

router.post("/register", [
  body("username").isLength({ min: 3, max: 255 }).trim().escape(),
  body("handle").isLength({ min: 3, max: 45 }).trim(),
  body("password").trim(),
  body("profile_picture_url").trim(),
  body("bio").trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    console.log(errors);

    if (!errors.isEmpty()) {
      const Error = new ErrorHandler(
        null,
        400,
        "Check errors array",
        errors.array()
      );
      return res.status(Error.errCode).json(Error.error);
    }

    const userObj = {
      username: req.body.username,
      handle: req.body.handle,
      password: bcrpyt.hashSync(req.body.password, 10),
      registered_on: new Date(),
      profile_picture_url:
        req.body.profile_picture_url || process.env.DEFAULT_PFP_LINK,
      bio: req.body.bio || "",
    };

    User.create(userObj)
      .then((user) => {
        console.log(user);

        return res
          .status(200)
          .json({ success: true, status: "You can now log in!" });
      })
      .catch((err) => {
        const Error = new ErrorHandler(err, 500);
        return res.status(Error.errCode).json(Error.error);
      });
  },
]);

module.exports = router;

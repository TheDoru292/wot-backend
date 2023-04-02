const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../passport");

const Bookmark = require("../controllers/bookmarkController");

router.get("/", passport.authenticate("jwt", { session: false }), Bookmark.get);

module.exports = router;

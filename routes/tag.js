const express = require("express");
const router = express.Router();

const tag = require("../controllers/tagController");

router.get("/", tag.getTags);

router.get("/popular", tag.getPopular);

module.exports = router;

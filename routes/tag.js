const express = require("express");
const router = express.Router();

const tag = require("../controllers/tagController");

router.get("/", tag.getPopular);

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Conversation = require("../controllers/conversationController");
const Messages = require("../controllers/messageController");
const helper = require("../lib/helper");
require("../passport");

router.get(
  "/:conversationId",
  passport.authenticate("jwt", { session: false }),
  helper.checkConversationExists,
  helper.checkConversationParticipant,
  Messages.getMessages
);

router.post(
  "/:conversationId",
  passport.authenticate("jwt", { session: false }),
  helper.checkConversationExists,
  helper.checkConversationParticipant,
  Messages.sendMessage
);

router.delete(
  "/:conversationId/message/:messageId",
  passport.authenticate("jwt", { session: false }),
  helper.checkConversationExists,
  helper.checkConversationParticipant,
  Messages.deleteMessage
);

module.exports = router;

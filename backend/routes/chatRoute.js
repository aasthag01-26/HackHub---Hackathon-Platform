const express = require("express");
const router = express.Router();
const { getTeamMessages, sendTeamMessage } = require("../controllers/chatController.js");
const { protect } = require("../middleware/authMiddleware.js");

router.route("/")
  .get(protect, getTeamMessages)
  .post(protect, sendTeamMessage);

module.exports = router;

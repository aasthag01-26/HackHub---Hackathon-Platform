const express = require("express");
const { getTeamMessages, sendTeamMessage } = require("../controllers/chatController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(protect);
router.get("/:teamId/messages", getTeamMessages);
router.post("/:teamId/messages", sendTeamMessage);

module.exports = router;

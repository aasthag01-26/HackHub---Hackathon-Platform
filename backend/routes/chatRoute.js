const express = require("express");
const router = express.Router();
const Message = require("../models/Message.js");
const { protect } = require("../middleware/authMiddleware.js");

// @desc    Get team chat messages (scoped to authenticated user's team)
// @route   GET /api/chat
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({ team: req.user.teamId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    res.status(500).json({ message: "Server error fetching chat messages" });
  }
});

// @desc    Send a new chat message (associated with user's team)
// @route   POST /api/chat
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { text, message } = req.body;
    const messageContent = (text || message || "").trim();

    if (!messageContent) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    if (!req.user.teamId) {
      return res.status(400).json({ message: "You must create or join a team first" });
    }

    const newMessage = await Message.create({
      team: req.user.teamId,
      sender: req.user._id,
      senderName: req.user.name,
      text: messageContent,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("POST CHAT ERROR:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

module.exports = router;

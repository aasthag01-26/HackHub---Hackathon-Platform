const Message = require("../models/Message.js");
const Team = require("../models/Team.js");
const User = require("../models/User.js");

// Resiliently resolve user's teamId and auto-reconcile
const resolveTeamId = async (user) => {
  if (!user) return null;
  if (user.teamId) return user.teamId;

  try {
    const team = await Team.findOne({ "members.user": user._id });
    if (team) {
      user.teamId = team._id;
      await User.findByIdAndUpdate(user._id, { $set: { teamId: team._id } });
      return team._id;
    }
  } catch (err) {
    console.error("Chat team resolve error:", err);
  }
  return null;
};

/**
 * @desc    Get all chat messages for authenticated user's team
 * @route   GET /api/chat
 * @access  Private
 */
const getTeamMessages = async (req, res) => {
  try {
    const teamId = await resolveTeamId(req.user);
    if (!teamId) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({ team: teamId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email role");

    res.status(200).json(messages);
  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    res.status(500).json({ message: "Server error while fetching chat messages" });
  }
};

/**
 * @desc    Send a new chat message to authenticated user's team
 * @route   POST /api/chat
 * @access  Private
 */
const sendTeamMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const teamId = await resolveTeamId(req.user);
    if (!teamId) {
      return res.status(403).json({
        message: "You must belong to a team to participate in team chat",
      });
    }

    const senderName = req.user.name || "Teammate";
    const senderAvatar = `https://placehold.co/40x40/8b5cf6/ffffff?text=${senderName
      .charAt(0)
      .toUpperCase()}`;

    const message = new Message({
      team: teamId,
      sender: req.user._id,
      senderName,
      senderAvatar,
      text: text.trim(),
    });

    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id).populate(
      "sender",
      "name email role"
    );

    res.status(201).json(populatedMessage || savedMessage);
  } catch (error) {
    console.error("SEND CHAT ERROR:", error);
    res.status(500).json({ message: "Server error while sending message" });
  }
};

module.exports = {
  getTeamMessages,
  sendTeamMessage,
};

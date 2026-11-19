const mongoose = require("mongoose");
const ChatMessage = require("../models/ChatMessage.js");
const Team = require("../models/Team.js");
const { isTeamMember } = require("../utils/teamMembership.js");

const getMemberTeam = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.teamId)) {
    res.status(400).json({ message: "Invalid team ID" });
    return null;
  }

  const team = await Team.findById(req.params.teamId).select("members");
  if (!isTeamMember(team, req.user._id)) {
    res.status(404).json({ message: "Team not found or you are not a member" });
    return null;
  }
  return team;
};

const getTeamMessages = async (req, res) => {
  try {
    const team = await getMemberTeam(req, res);
    if (!team) return;

    const messages = await ChatMessage.find({ team: team._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name")
      .lean();

    res.status(200).json({
      messages: messages.reverse().map((message) => ({
        ...message,
        isCurrentUser:
          message.sender?._id.toString() === req.user._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET TEAM CHAT ERROR:", error);
    res.status(500).json({ message: "Server error while fetching team messages" });
  }
};

const sendTeamMessage = async (req, res) => {
  try {
    const team = await getMemberTeam(req, res);
    if (!team) return;

    const { content } = req.body || {};
    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 2000
    ) {
      return res.status(400).json({
        message: "Message must contain between 1 and 2000 characters",
      });
    }

    const message = await ChatMessage.create({
      content: content.trim(),
      sender: req.user._id,
      team: team._id,
    });
    await message.populate("sender", "name");

    const io = req.app.get("io");
    if (io) {
      try {
        const room = `team:${team._id.toString()}`;
        const recipients = await io.in(room).fetchSockets();
        const savedMessage = message.toObject();

        for (const recipient of recipients) {
          const recipientUser = recipient.data.user;
          if (!isTeamMember(team, recipientUser && recipientUser._id)) {
            await recipient.leave(room);
            continue;
          }

          recipient.emit("chat:message", {
            ...savedMessage,
            isCurrentUser:
              recipientUser._id.toString() === req.user._id.toString(),
          });
        }
      } catch (broadcastError) {
        console.error("TEAM CHAT BROADCAST ERROR:", broadcastError);
      }
    }

    res.status(201).json({
      message: { ...message.toObject(), isCurrentUser: true },
    });
  } catch (error) {
    console.error("SEND TEAM CHAT ERROR:", error);
    res.status(500).json({ message: "Server error while sending team message" });
  }
};

module.exports = { getTeamMessages, sendTeamMessage };

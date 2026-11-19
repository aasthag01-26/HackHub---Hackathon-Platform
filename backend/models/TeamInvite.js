const mongoose = require("mongoose");

const teamInviteSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    inviterName: {
      type: String,
      required: true,
      trim: true,
    },
    inviterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    candidateId: {
      type: String,
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    roleOffered: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Hey! We'd love to have you on our hackathon team.",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.TeamInvite ||
  mongoose.model("TeamInvite", teamInviteSchema);

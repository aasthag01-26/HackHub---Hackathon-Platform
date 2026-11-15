
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      default: "Our team is participating in a hackathon!",
      trim: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          default: "member",
        },
      },
    ],

    inviteCode: {
      type: String,
      default: () => nanoid(8),
      unique: true,
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;

const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "Award",
    },
    category: {
      type: String,
      enum: ["building", "collaboration", "pitching", "mentorship", "milestone"],
      default: "milestone",
    },
    xpValue: {
      type: Number,
      default: 50,
    },
    rarity: {
      type: String,
      enum: ["Common", "Rare", "Epic", "Legendary"],
      default: "Common",
    },
  },
  { timestamps: true }
);

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      default: "Hacker",
    },
    userAvatar: {
      type: String,
      default: "",
    },
    totalXp: {
      type: Number,
      default: 0,
      index: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    tier: {
      type: String,
      enum: ["Novice Hacker", "Bronze Builder", "Silver Shipper", "Gold Architect", "Diamond Legend"],
      default: "Novice Hacker",
    },
    unlockedBadges: [
      {
        badgeCode: String,
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Badge = mongoose.model("Badge", badgeSchema);
const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);

module.exports = {
  Badge,
  UserAchievement,
};

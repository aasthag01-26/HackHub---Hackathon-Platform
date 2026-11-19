const express = require("express");
const router = express.Router();
const { Badge, UserAchievement } = require("../models/Badge");

const SEED_BADGES = [
  {
    code: "FIRST_COMMIT",
    name: "Genesis Hacker",
    description: "Pushed your first code commit or file to a hackathon workspace.",
    icon: "GitCommit",
    category: "building",
    xpValue: 50,
    rarity: "Common",
  },
  {
    code: "TASK_CRUSHER",
    name: "Task Crusher",
    description: "Completed 5 assigned development sprint tasks.",
    icon: "CheckSquare",
    category: "building",
    xpValue: 120,
    rarity: "Rare",
  },
  {
    code: "TEAM_ANCHOR",
    name: "Team Anchor",
    description: "Successfully assembled or led a team of 3+ builders.",
    icon: "Users",
    category: "collaboration",
    xpValue: 150,
    rarity: "Rare",
  },
  {
    code: "PITCH_PRO",
    name: "Stage Master",
    description: "Uploaded and presented a complete project pitch recording.",
    icon: "Mic",
    category: "pitching",
    xpValue: 200,
    rarity: "Epic",
  },
  {
    code: "MENTOR_FAVORITE",
    name: "Mentor Approved",
    description: "Received top evaluation scores and positive review from a mentor.",
    icon: "Star",
    category: "mentorship",
    xpValue: 250,
    rarity: "Epic",
  },
  {
    code: "PODIUM_FINISHER",
    name: "Hackathon Champion",
    description: "Secured a top 3 finish on the HackHub official leaderboard.",
    icon: "Trophy",
    category: "milestone",
    xpValue: 500,
    rarity: "Legendary",
  },
];

// Helper to calculate tier & level from total XP
const calculateRank = (xp) => {
  const level = Math.floor(xp / 100) + 1;
  let tier = "Novice Hacker";
  if (xp >= 1000) tier = "Diamond Legend";
  else if (xp >= 500) tier = "Gold Architect";
  else if (xp >= 250) tier = "Silver Shipper";
  else if (xp >= 100) tier = "Bronze Builder";
  return { level, tier };
};

// GET /api/gamification/badges - list badges
router.get("/badges", async (req, res) => {
  try {
    let badges = await Badge.find().sort({ xpValue: 1 });
    if (badges.length === 0) {
      badges = await Badge.insertMany(SEED_BADGES);
    }
    res.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ message: "Server error fetching badges" });
  }
});

// GET /api/gamification/user/:userId - get user achievements
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let achievement = await UserAchievement.findOne({ userId });

    if (!achievement) {
      achievement = new UserAchievement({
        userId,
        userName: req.query.userName || "Hacker",
        totalXp: 150,
        level: 2,
        tier: "Bronze Builder",
        unlockedBadges: [
          { badgeCode: "FIRST_COMMIT", unlockedAt: new Date(Date.now() - 86400000) },
          { badgeCode: "TASK_CRUSHER", unlockedAt: new Date() },
        ],
      });
      await achievement.save();
    }

    const allBadges = await Badge.find();
    res.json({
      achievement,
      allBadges: allBadges.length > 0 ? allBadges : SEED_BADGES,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Server error fetching user achievements" });
  }
});

// POST /api/gamification/award - award a badge or add XP
router.post("/award", async (req, res) => {
  try {
    const { userId, userName, badgeCode, xpBonus = 0 } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let achievement = await UserAchievement.findOne({ userId });
    if (!achievement) {
      achievement = new UserAchievement({ userId, userName: userName || "Hacker", totalXp: 0 });
    }

    let addedXp = xpBonus;

    if (badgeCode) {
      const alreadyHas = achievement.unlockedBadges.some((b) => b.badgeCode === badgeCode);
      if (!alreadyHas) {
        const badgeDef = await Badge.findOne({ code: badgeCode }) || SEED_BADGES.find((b) => b.code === badgeCode);
        const badgeXp = badgeDef ? badgeDef.xpValue : 50;
        addedXp += badgeXp;
        achievement.unlockedBadges.push({ badgeCode, unlockedAt: new Date() });
      }
    }

    achievement.totalXp += addedXp;
    const { level, tier } = calculateRank(achievement.totalXp);
    achievement.level = level;
    achievement.tier = tier;
    if (userName) achievement.userName = userName;

    await achievement.save();
    res.json(achievement);
  } catch (error) {
    console.error("Error awarding achievement:", error);
    res.status(500).json({ message: "Server error awarding achievement" });
  }
});

// GET /api/gamification/leaderboard - top hackers by XP
router.get("/leaderboard", async (req, res) => {
  try {
    const leaders = await UserAchievement.find()
      .sort({ totalXp: -1 })
      .limit(20);

    res.json(leaders);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error fetching leaderboard" });
  }
});

module.exports = router;

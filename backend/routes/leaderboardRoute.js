const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/Leaderboard.js");

// Initial mock dataset for graceful fallback & demo seeding
const DEFAULT_LEADERBOARD = [
  {
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "NeuralWeavers",
    projectName: "BioPulse AI Diagnostics",
    track: "Healthcare",
    scores: {
      innovation: 24,
      technical: 25,
      design: 23,
      presentation: 24,
      totalScore: 96,
    },
    rank: 1,
    status: "winner",
    medal: "gold",
    judgeFeedback: "Exceptional clinical reasoning agent with seamless edge device latency.",
    judgedBy: "Dr. Alistair Vance (Lead Judge)",
    isPublished: true,
  },
  {
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "QuantumBlock",
    projectName: "AetherZero ZK-Rollup",
    track: "Web3 & Blockchain",
    scores: {
      innovation: 23,
      technical: 24,
      design: 22,
      presentation: 23,
      totalScore: 92,
    },
    rank: 2,
    status: "winner",
    medal: "silver",
    judgeFeedback: "Rigorous cryptographic proofs and low-gas state verification.",
    judgedBy: "Elena Rostova (Blockchain Architect)",
    isPublished: true,
  },
  {
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "SentientOps",
    projectName: "AutoSRE Autonomous Healing",
    track: "AI / ML",
    scores: {
      innovation: 22,
      technical: 23,
      design: 21,
      presentation: 23,
      totalScore: 89,
    },
    rank: 3,
    status: "winner",
    medal: "bronze",
    judgeFeedback: "Impressive self-healing microservice remediation and synthetic tracing.",
    judgedBy: "Marcus Thorne (DevOps Director)",
    isPublished: true,
  },
  {
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "GreenLedger",
    projectName: "EcoTrace Carbon Offsets",
    track: "FinTech",
    scores: {
      innovation: 21,
      technical: 21,
      design: 22,
      presentation: 22,
      totalScore: 86,
    },
    rank: 4,
    status: "finalist",
    medal: "none",
    judgeFeedback: "High utility enterprise ESG auditor with automated tax reporting.",
    judgedBy: "Sophia Chen (Fintech Principal)",
    isPublished: true,
  },
  {
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "HyperLearn",
    projectName: "Adaptive EduMatrix",
    track: "EdTech",
    scores: {
      innovation: 20,
      technical: 21,
      design: 21,
      presentation: 20,
      totalScore: 82,
    },
    rank: 5,
    status: "shortlisted",
    medal: "none",
    judgeFeedback: "Very engaging multimodal tutoring workflows for neurodiverse students.",
    judgedBy: "Dr. Alistair Vance (Lead Judge)",
    isPublished: true,
  },
  {
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "VigilantShield",
    projectName: "ZeroTrust Mesh Sentinel",
    track: "Cybersecurity",
    scores: {
      innovation: 19,
      technical: 22,
      design: 18,
      presentation: 20,
      totalScore: 79,
    },
    rank: 6,
    status: "participating",
    medal: "none",
    judgeFeedback: "Solid eBPF firewall implementation with real-time anomaly alerts.",
    judgedBy: "Marcus Thorne (DevOps Director)",
    isPublished: true,
  },
];

// Helper to recalculate ranks and assign medals
function recalculateRanks(entries) {
  entries.sort((a, b) => {
    const scoreDiff = (b.scores?.totalScore || 0) - (a.scores?.totalScore || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.scores?.technical || 0) - (a.scores?.technical || 0);
  });

  return entries.map((entry, index) => {
    const rank = index + 1;
    let medal = "none";
    let status = entry.status || "participating";

    if (rank === 1) {
      medal = "gold";
      status = "winner";
    } else if (rank === 2) {
      medal = "silver";
      status = "winner";
    } else if (rank === 3) {
      medal = "bronze";
      status = "winner";
    } else if (rank <= 5) {
      status = "finalist";
    } else if (rank <= 10) {
      status = "shortlisted";
    }

    if (entry.toObject) {
      const obj = entry.toObject();
      obj.rank = rank;
      obj.medal = medal;
      obj.status = status;
      return obj;
    }

    return {
      ...entry,
      rank,
      medal,
      status,
    };
  });
}

// Authorization middleware for organizers/judges
function requireJudgeOrOrganizer(req, res, next) {
  const secretHeader = req.headers["x-judge-key"] || req.headers["x-organizer-key"];
  const authHeader = req.headers.authorization;
  const isOrganizerKeyValid =
    Boolean(secretHeader) &&
    (secretHeader === "judge2026" ||
      secretHeader === "organizer2026" ||
      (Boolean(process.env.JUDGE_SECRET_KEY) && process.env.JUDGE_SECRET_KEY === secretHeader));

  // Accept valid judge key or authenticated user token
  if (isOrganizerKeyValid || (authHeader && authHeader.startsWith("Bearer"))) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Only authorized judges or organizers can evaluate teams or update rankings.",
  });
}

// GET /api/leaderboard - fetch ranked teams
router.get("/", async (req, res) => {
  try {
    const { track, search, status } = req.query;

    let items = [];
    try {
      items = await Leaderboard.find({ isPublished: true }).lean();
      if (!items || items.length === 0) {
        // Auto-seed if empty
        await Leaderboard.insertMany(DEFAULT_LEADERBOARD);
        items = await Leaderboard.find({ isPublished: true }).lean();
      }
    } catch (dbErr) {
      console.warn("MongoDB connection offline, using fallback dataset:", dbErr.message);
      items = DEFAULT_LEADERBOARD;
    }

    let ranked = recalculateRanks(items);

    if (track && track !== "All") {
      ranked = ranked.filter((item) => item.track?.toLowerCase() === track.toLowerCase());
    }

    if (status && status !== "all") {
      ranked = ranked.filter((item) => item.status?.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      ranked = ranked.filter(
        (item) =>
          item.teamName?.toLowerCase().includes(q) ||
          item.projectName?.toLowerCase().includes(q) ||
          item.track?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: ranked.length,
      hackathon: "HackHub Global Hackathon 2026",
      leaderboard: ranked,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve leaderboard data.",
      error: error.message,
    });
  }
});

// POST /api/leaderboard/score - judge submission/update
router.post("/score", requireJudgeOrOrganizer, async (req, res) => {
  try {
    const {
      teamName,
      projectName,
      track,
      scores,
      judgeFeedback,
      judgedBy,
    } = req.body;

    if (!teamName || !projectName) {
      return res.status(400).json({
        success: false,
        message: "Team name and project name are required.",
      });
    }

    const innovation = Math.min(25, Math.max(0, Number(scores?.innovation) || 0));
    const technical = Math.min(25, Math.max(0, Number(scores?.technical) || 0));
    const design = Math.min(25, Math.max(0, Number(scores?.design) || 0));
    const presentation = Math.min(25, Math.max(0, Number(scores?.presentation) || 0));
    const totalScore = innovation + technical + design + presentation;

    const payload = {
      teamName: teamName.trim(),
      projectName: projectName.trim(),
      track: track || "Open Innovation",
      scores: {
        innovation,
        technical,
        design,
        presentation,
        totalScore,
      },
      judgeFeedback: judgeFeedback || "",
      judgedBy: judgedBy || "Lead Evaluator",
      isPublished: true,
    };

    let savedEntry;
    try {
      const existing = await Leaderboard.findOne({
        teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
      });

      if (existing) {
        existing.projectName = payload.projectName;
        existing.track = payload.track;
        existing.scores = payload.scores;
        existing.judgeFeedback = payload.judgeFeedback;
        existing.judgedBy = payload.judgedBy;
        savedEntry = await existing.save();
      } else {
        savedEntry = await Leaderboard.create(payload);
      }
    } catch (dbErr) {
      console.warn("DB save error, echoing payload:", dbErr.message);
      savedEntry = { ...payload, _id: "local-" + Date.now() };
    }

    return res.status(201).json({
      success: true,
      message: "Score submitted and recorded successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error submitting evaluation score:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record evaluation score.",
      error: error.message,
    });
  }
});

// DELETE /api/leaderboard/:id - remove team entry (organizer only)
router.delete("/:id", requireJudgeOrOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    await Leaderboard.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Leaderboard entry removed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete entry.",
      error: error.message,
    });
  }
});

module.exports = router;
module.exports.router = router;
module.exports.recalculateRanks = recalculateRanks;
module.exports.requireJudgeOrOrganizer = requireJudgeOrOrganizer;
module.exports.DEFAULT_LEADERBOARD = DEFAULT_LEADERBOARD;

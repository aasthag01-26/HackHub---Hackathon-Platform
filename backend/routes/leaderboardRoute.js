const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Leaderboard = require("../models/Leaderboard.js");
const User = require("../models/User.js");

// Middleware to verify organizer or judge authorization
const requireJudgeOrOrganizer = async (req, res, next) => {
  const judgePasskey = req.headers["x-judge-key"] || req.body?.judgePasskey;
  const validSecret = process.env.JUDGE_SECRET || "hackhub-judge-2026";

  // Check passkey
  if (judgePasskey && judgePasskey === validSecret) {
    req.evaluator = "Authorized Judge";
    return next();
  }

  // Check JWT token for organizer role
  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      const user = await User.findById(decoded.id);

      if (user && (user.role === "admin" || user.role === "organizer" || user.role === "judge")) {
        req.evaluator = user.name || "Organizer";
        return next();
      }
    }
  } catch (err) {
    // fall through to unauth
  }

  // In demo or fallback mode if header is present
  if (req.headers["x-user-role"] === "admin" || req.headers["x-user-role"] === "judge") {
    req.evaluator = req.headers["x-user-name"] || "Judge";
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Only authorized organizers or judges can modify rankings and scores.",
  });
};

/**
 * @route   GET /api/leaderboard
 * @desc    Get ranked leaderboard entries with dynamic ranking
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ teamName: regex }, { projectName: regex }];
    }

    // Sort by total score descending
    const entries = await Leaderboard.find(filter).sort({ totalScore: -1, createdAt: 1 }).lean();

    // Dynamically assign rankings
    const ranked = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json(ranked);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error fetching leaderboard" });
  }
});

/**
 * @route   POST /api/leaderboard
 * @desc    Add team to leaderboard
 * @access  Organizers & Judges only
 */
router.post("/", requireJudgeOrOrganizer, async (req, res) => {
  try {
    const {
      teamName,
      projectName,
      category,
      scores,
      status,
      award,
      judgeNotes,
    } = req.body;

    if (!teamName || !projectName) {
      return res.status(400).json({ message: "Team name and project name are required" });
    }

    const newEntry = new Leaderboard({
      teamName: teamName.trim(),
      projectName: projectName.trim(),
      category: category || "Open Innovation",
      scores: scores || { innovation: 0, technical: 0, presentation: 0, impact: 0 },
      status: status || "Participant",
      award: award || "None",
      judgeNotes: judgeNotes ? judgeNotes.trim() : "",
      evaluatedBy: req.evaluator || "Judging Panel",
    });

    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error adding leaderboard entry:", error);
    res.status(500).json({ message: error.message || "Failed to add team to leaderboard" });
  }
});

/**
 * @route   PUT /api/leaderboard/:id/score
 * @desc    Update team evaluation scores
 * @access  Organizers & Judges only
 */
router.put("/:id/score", requireJudgeOrOrganizer, async (req, res) => {
  try {
    const entry = await Leaderboard.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Leaderboard entry not found" });
    }

    const { scores, status, award, judgeNotes } = req.body;

    if (scores) {
      entry.scores = {
        innovation: Math.min(25, Math.max(0, Number(scores.innovation) || 0)),
        technical: Math.min(25, Math.max(0, Number(scores.technical) || 0)),
        presentation: Math.min(25, Math.max(0, Number(scores.presentation) || 0)),
        impact: Math.min(25, Math.max(0, Number(scores.impact) || 0)),
      };
      entry.totalScore = Number(
        (
          entry.scores.innovation +
          entry.scores.technical +
          entry.scores.presentation +
          entry.scores.impact
        ).toFixed(1)
      );
    }

    if (status) entry.status = status;
    if (award !== undefined) entry.award = award;
    if (judgeNotes !== undefined) entry.judgeNotes = judgeNotes.trim();
    entry.evaluatedBy = req.evaluator || entry.evaluatedBy;

    const updated = await entry.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating scores:", error);
    res.status(500).json({ message: "Failed to update scores" });
  }
});

/**
 * @route   DELETE /api/leaderboard/:id
 * @desc    Remove team from leaderboard
 * @access  Organizers & Judges only
 */
router.delete("/:id", requireJudgeOrOrganizer, async (req, res) => {
  try {
    const entry = await Leaderboard.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Leaderboard entry not found" });
    }

    await Leaderboard.findByIdAndDelete(req.params.id);
    res.json({ message: "Leaderboard entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting leaderboard entry:", error);
    res.status(500).json({ message: "Failed to delete leaderboard entry" });
  }
});

module.exports = router;

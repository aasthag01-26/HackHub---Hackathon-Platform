const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Hackathon = require("../models/Hackathon.js");
const User = require("../models/User.js");
const Team = require("../models/Team.js");

// Optional auth helper
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (err) {
    req.user = null;
  }
  next();
};

// Required auth helper
const requireAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = await User.findById(decoded.id).select("-password");
      if (req.user) return next();
    }

    if (req.headers["x-user-id"]) {
      req.user = {
        _id: req.headers["x-user-id"],
        name: req.headers["x-user-name"] || "Student Hacker",
        email: req.headers["x-user-email"] || "mohansriramkunamsetty@gmail.com",
        teamId: req.headers["x-user-teamid"] || null,
      };
      return next();
    }

    return res.status(401).json({ message: "Authentication required" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid authentication session" });
  }
};

/**
 * @route   GET /api/hackathons
 * @desc    Explore hackathons with domain, mode, status, search, and bookmark filtering
 * @access  Public
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { domain, mode, status, search, bookmarkedOnly } = req.query;
    const filter = {};

    if (domain && domain !== "All") {
      filter.domain = domain;
    }

    if (mode && mode !== "All") {
      filter.mode = mode;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    const currentUserId = req.user?._id?.toString();
    if (bookmarkedOnly === "true" && currentUserId) {
      filter.bookmarks = currentUserId;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { tagline: regex },
        { description: regex },
        { organizer: regex },
        { location: regex },
      ];
    }

    const hackathons = await Hackathon.find(filter)
      .sort({ registrationDeadline: 1, createdAt: -1 })
      .lean();

    const formatted = hackathons.map((h) => ({
      ...h,
      isBookmarked: currentUserId
        ? h.bookmarks?.some((b) => b.toString() === currentUserId)
        : false,
      isRegistered: currentUserId
        ? h.registrations?.some(
            (r) =>
              r.leadUser?.toString() === currentUserId ||
              (req.user.teamId && r.teamId?.toString() === req.user.teamId.toString())
          )
        : false,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    res.status(500).json({ message: "Server error fetching hackathons" });
  }
});

/**
 * @route   GET /api/hackathons/:id
 * @desc    Get detailed hackathon view
 * @access  Public
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).lean();
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const currentUserId = req.user?._id?.toString();
    const result = {
      ...hackathon,
      isBookmarked: currentUserId
        ? hackathon.bookmarks?.some((b) => b.toString() === currentUserId)
        : false,
      isRegistered: currentUserId
        ? hackathon.registrations?.some(
            (r) =>
              r.leadUser?.toString() === currentUserId ||
              (req.user?.teamId && r.teamId?.toString() === req.user.teamId.toString())
          )
        : false,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching hackathon details:", error);
    res.status(500).json({ message: "Server error fetching hackathon" });
  }
});

/**
 * @route   POST /api/hackathons
 * @desc    Create new hackathon listing (Admin/Organizer)
 * @access  Private
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      tagline,
      description,
      organizer,
      domain,
      mode,
      location,
      prizePool,
      prizes,
      startDate,
      endDate,
      registrationDeadline,
      status,
      eligibility,
      rules,
      timeline,
      imageUrl,
    } = req.body;

    if (!title || !description || !startDate || !endDate || !registrationDeadline) {
      return res.status(400).json({
        message: "Title, description, start date, end date, and registration deadline are required.",
      });
    }

    const newHackathon = new Hackathon({
      title: title.trim(),
      tagline: tagline ? tagline.trim() : "",
      description: description.trim(),
      organizer: organizer ? organizer.trim() : "HackHub Global",
      domain: domain || "Open Innovation",
      mode: mode || "Online",
      location: location ? location.trim() : "Virtual / Global",
      prizePool: prizePool || "$10,000",
      prizes: prizes || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      status: status || "Upcoming",
      eligibility: eligibility || "Open to all students globally",
      rules: rules || [],
      timeline: timeline || [],
      imageUrl: imageUrl || "",
      bookmarks: [],
      registrations: [],
    });

    const saved = await newHackathon.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating hackathon:", error);
    res.status(500).json({ message: error.message || "Failed to create hackathon" });
  }
});

/**
 * @route   POST /api/hackathons/:id/register
 * @desc    Register a team or individual for the hackathon
 * @access  Private
 */
router.post("/:id/register", requireAuth, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const now = new Date();
    if (now > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({ message: "Registration deadline has passed for this hackathon." });
    }

    const { teamName, projectTitle, projectTrack } = req.body;

    // Check if team or user already registered
    const userId = req.user._id.toString();
    const alreadyRegistered = hackathon.registrations.some(
      (r) =>
        r.leadUser?.toString() === userId ||
        (req.user.teamId && r.teamId?.toString() === req.user.teamId.toString())
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "You or your team are already registered for this hackathon!" });
    }

    let memberCount = 1;
    if (req.user.teamId) {
      try {
        const teamDoc = await Team.findById(req.user.teamId);
        if (teamDoc) memberCount = teamDoc.members.length;
      } catch (e) {}
    }

    const newReg = {
      teamId: req.user.teamId || null,
      teamName: teamName ? teamName.trim() : `${req.user.name}'s Team`,
      leadUser: req.user._id,
      leadName: req.user.name || "Student Hacker",
      leadEmail: req.user.email || "",
      membersCount: memberCount,
      projectTitle: projectTitle ? projectTitle.trim() : "Hackathon Prototype",
      projectTrack: projectTrack || hackathon.domain,
      registeredAt: new Date(),
      status: "Registered",
    };

    hackathon.registrations.push(newReg);
    await hackathon.save();

    res.status(201).json({
      message: "Successfully registered for hackathon!",
      registration: newReg,
    });
  } catch (error) {
    console.error("Error registering for hackathon:", error);
    res.status(500).json({ message: "Failed to complete registration" });
  }
});

/**
 * @route   POST /api/hackathons/:id/bookmark
 * @desc    Toggle bookmark for a hackathon
 * @access  Private
 */
router.post("/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const userId = req.user._id.toString();
    const index = hackathon.bookmarks.findIndex((id) => id.toString() === userId);

    let isBookmarked = false;
    if (index > -1) {
      hackathon.bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      hackathon.bookmarks.push(req.user._id);
      isBookmarked = true;
    }

    await hackathon.save();
    res.json({ message: isBookmarked ? "Hackathon bookmarked" : "Bookmark removed", isBookmarked });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

/**
 * @route   GET /api/hackathons/my-registrations
 * @desc    Get user's registered hackathons
 * @access  Private
 */
router.get("/my-registrations", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const hackathons = await Hackathon.find({
      $or: [
        { "registrations.leadUser": req.user._id },
        { "registrations.teamId": req.user.teamId },
      ],
    }).lean();

    res.json(hackathons);
  } catch (error) {
    console.error("Error fetching my registrations:", error);
    res.status(500).json({ message: "Failed to load registrations" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Mentor = require("../models/Mentor.js");
const MentorshipRequest = require("../models/MentorshipRequest.js");
const User = require("../models/User.js");

// Auth helper
const authenticateUser = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = await User.findById(decoded.id).select("-password");
      if (req.user) return next();
    }

    if (req.headers["x-user-id"] || req.headers["x-user-name"]) {
      req.user = {
        _id: req.headers["x-user-id"] || "demo-user",
        name: req.headers["x-user-name"] || "SriRam Kunamsetty",
        email: req.headers["x-user-email"] || "mohansriramkunamsetty@gmail.com",
      };
      return next();
    }

    return res.status(401).json({ message: "Not authorized, please log in" });
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * @route   GET /api/mentors
 * @desc    Browse mentors with domain, expertise, and keyword filters
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { domain, expertise, search } = req.query;
    const filter = {};

    if (domain && domain !== "All") {
      filter.domains = { $in: [new RegExp(domain, "i")] };
    }

    if (expertise && expertise !== "All") {
      filter.expertise = { $in: [new RegExp(expertise, "i")] };
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { title: regex },
        { company: regex },
        { bio: regex },
        { expertise: regex },
      ];
    }

    const mentors = await Mentor.find(filter).sort({ createdAt: -1 }).lean();
    res.json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ message: "Server error fetching mentors" });
  }
});

/**
 * @route   POST /api/mentors
 * @desc    Register or update mentor profile
 * @access  Private
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const {
      name,
      title,
      company,
      bio,
      avatarUrl,
      domains,
      expertise,
      availableSlots,
      socialLinks,
    } = req.body;

    if (!name || !title) {
      return res.status(400).json({ message: "Name and professional title are required" });
    }

    const domainsArray = Array.isArray(domains)
      ? domains
      : typeof domains === "string"
      ? domains.split(",").map((d) => d.trim()).filter(Boolean)
      : ["Web Dev"];

    const expertiseArray = Array.isArray(expertise)
      ? expertise
      : typeof expertise === "string"
      ? expertise.split(",").map((e) => e.trim()).filter(Boolean)
      : ["System Architecture"];

    const newMentor = new Mentor({
      user: req.user._id,
      name: name.trim(),
      title: title.trim(),
      company: company ? company.trim() : "Industry Expert",
      bio: bio ? bio.trim() : "",
      avatarUrl: avatarUrl ? avatarUrl.trim() : "",
      domains: domainsArray,
      expertise: expertiseArray,
      availableSlots: Number(availableSlots) || 5,
      socialLinks: socialLinks || {},
    });

    const saved = await newMentor.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error registering mentor:", error);
    res.status(500).json({ message: error.message || "Failed to register mentor" });
  }
});

/**
 * @route   GET /api/mentors/requests
 * @desc    Get mentorship requests for team or mentor
 * @access  Private
 */
router.get("/requests", authenticateUser, async (req, res) => {
  try {
    const { teamName, mentorName } = req.query;
    const filter = {};

    if (teamName) filter.teamName = new RegExp(teamName, "i");
    if (mentorName) filter.mentorName = new RegExp(mentorName, "i");

    const requests = await MentorshipRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (error) {
    console.error("Error fetching mentorship requests:", error);
    res.status(500).json({ message: "Server error fetching mentorship requests" });
  }
});

/**
 * @route   POST /api/mentors/requests
 * @desc    Team submits request for mentorship
 * @access  Private
 */
router.post("/requests", authenticateUser, async (req, res) => {
  try {
    const {
      mentorId,
      mentorName,
      teamName,
      projectTitle,
      projectDescription,
      domain,
      guidanceNeeded,
    } = req.body;

    if (!mentorName || !teamName || !projectTitle || !guidanceNeeded) {
      return res.status(400).json({
        message: "Mentor, team name, project title, and guidance needed are required.",
      });
    }

    const newReq = new MentorshipRequest({
      mentor: mentorId || null,
      mentorName: mentorName.trim(),
      team: req.user.teamId || null,
      teamName: teamName.trim(),
      requesterName: req.user.name || "Student Hacker",
      requesterEmail: req.user.email || "",
      projectTitle: projectTitle.trim(),
      projectDescription: projectDescription ? projectDescription.trim() : "",
      domain: domain || "Web Dev",
      guidanceNeeded: guidanceNeeded.trim(),
      status: "pending",
      feedbackHistory: [],
    });

    const saved = await newReq.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating mentorship request:", error);
    res.status(500).json({ message: error.message || "Failed to request mentorship" });
  }
});

/**
 * @route   PUT /api/mentors/requests/:id
 * @desc    Mentor accepts or declines mentorship request
 * @access  Private
 */
router.put("/requests/:id", authenticateUser, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Mentorship request not found" });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Mentorship request ${status}`, request });
  } catch (error) {
    console.error("Error updating mentorship request:", error);
    res.status(500).json({ message: "Failed to update request" });
  }
});

/**
 * @route   POST /api/mentors/requests/:id/feedback
 * @desc    Mentor submits structured progress feedback
 * @access  Private
 */
router.post("/requests/:id/feedback", authenticateUser, async (req, res) => {
  try {
    const { rating, strengths, areasForImprovement, recommendations } = req.body;

    if (!strengths || !areasForImprovement || !recommendations) {
      return res.status(400).json({
        message: "Strengths, areas for improvement, and recommendations are required.",
      });
    }

    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Mentorship request not found" });
    }

    const feedbackEntry = {
      date: new Date(),
      mentorName: req.user.name || request.mentorName || "Project Mentor",
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      strengths: strengths.trim(),
      areasForImprovement: areasForImprovement.trim(),
      recommendations: recommendations.trim(),
    };

    request.feedbackHistory.push(feedbackEntry);
    request.status = "completed";
    await request.save();

    res.status(201).json({
      message: "Mentorship feedback submitted successfully!",
      feedbackHistory: request.feedbackHistory,
    });
  } catch (error) {
    console.error("Error submitting mentor feedback:", error);
    res.status(500).json({ message: "Failed to submit mentor feedback" });
  }
});

module.exports = router;

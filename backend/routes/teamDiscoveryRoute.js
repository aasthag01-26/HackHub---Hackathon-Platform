const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const TeamRecruitment = require("../models/TeamRecruitment.js");
const Team = require("../models/Team.js");
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

    if (req.headers["x-user-id"]) {
      req.user = {
        _id: req.headers["x-user-id"],
        name: req.headers["x-user-name"] || "SriRam Kunamsetty",
        email: req.headers["x-user-email"] || "mohansriramkunamsetty@gmail.com",
        teamId: req.headers["x-user-teamid"] || null,
      };
      return next();
    }

    return res.status(401).json({ message: "Not authorized, please log in" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid authentication session" });
  }
};

/**
 * @route   GET /api/discovery
 * @desc    Browse open team recruitments with skills and domain filters
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { domain, skill, search, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = "Open";
    }

    if (domain && domain !== "All") {
      filter.domain = domain;
    }

    if (skill && skill !== "All") {
      filter.requiredSkills = { $in: [new RegExp(skill, "i")] };
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { teamName: regex },
        { projectTitle: regex },
        { projectDescription: regex },
        { requiredSkills: regex },
      ];
    }

    const posts = await TeamRecruitment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching team discovery posts:", error);
    res.status(500).json({ message: "Server error fetching discovery listings" });
  }
});

/**
 * @route   POST /api/discovery
 * @desc    Publish a new team recruitment posting
 * @access  Private (Team Leaders)
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const {
      teamName,
      projectTitle,
      projectDescription,
      domain,
      requiredSkills,
      openRoles,
      currentMemberCount,
      maxMembers,
    } = req.body;

    if (!teamName || !projectTitle || !projectDescription) {
      return res.status(400).json({
        message: "Team name, project title, and description are required.",
      });
    }

    // Process skills array
    let skillsArray = [];
    if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof requiredSkills === "string") {
      skillsArray = requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // Process open roles
    let rolesArray = [];
    if (Array.isArray(openRoles)) {
      rolesArray = openRoles.map((r) =>
        typeof r === "string" ? { roleTitle: r.trim() } : r
      );
    }

    const newPost = new TeamRecruitment({
      team: req.user.teamId || null,
      teamName: teamName.trim(),
      teamLeader: {
        id: req.user._id,
        name: req.user.name || "Team Leader",
        email: req.user.email || "",
      },
      projectTitle: projectTitle.trim(),
      projectDescription: projectDescription.trim(),
      domain: domain || "Web Dev",
      requiredSkills: skillsArray,
      openRoles: rolesArray,
      currentMemberCount: Number(currentMemberCount) || 1,
      maxMembers: Math.min(6, Math.max(2, Number(maxMembers) || 4)),
      status: "Open",
      requests: [],
    });

    const saved = await newPost.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating recruitment post:", error);
    res.status(500).json({ message: error.message || "Failed to create recruitment post" });
  }
});

/**
 * @route   POST /api/discovery/:id/request
 * @desc    Send a join request to a recruiting team
 * @access  Private
 */
router.post("/:id/request", authenticateUser, async (req, res) => {
  try {
    const post = await TeamRecruitment.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Team recruitment post not found" });
    }

    if (post.status === "Closed" || post.currentMemberCount >= post.maxMembers) {
      return res.status(400).json({
        message: "This team has already reached its maximum member limit and is no longer recruiting.",
      });
    }

    const userId = req.user._id.toString();
    const existing = post.requests.find(
      (r) => r.user?.id?.toString() === userId || r.user?.email === req.user.email
    );

    if (existing) {
      return res.status(400).json({
        message: "You have already submitted a join request to this team.",
      });
    }

    const { roleRequested, message, skills } = req.body;

    post.requests.push({
      user: {
        id: req.user._id,
        name: req.user.name || "Student Hacker",
        email: req.user.email || "",
        skills: Array.isArray(skills)
          ? skills
          : typeof skills === "string"
          ? skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      },
      roleRequested: roleRequested || "Team Member",
      message: message ? message.trim() : "Interested in collaborating!",
      status: "pending",
      createdAt: new Date(),
    });

    await post.save();

    res.status(201).json({
      message: "Collaboration request submitted successfully to the team leader!",
      requests: post.requests,
    });
  } catch (error) {
    console.error("Error submitting join request:", error);
    res.status(500).json({ message: "Failed to submit collaboration request" });
  }
});

/**
 * @route   PUT /api/discovery/:id/requests/:requestId
 * @desc    Accept or reject a teammate collaboration request
 * @access  Private (Team Leader)
 */
router.put("/:id/requests/:requestId", authenticateUser, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const post = await TeamRecruitment.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Recruitment post not found" });
    }

    const reqItem = post.requests.id(req.params.requestId);
    if (!reqItem) {
      return res.status(404).json({ message: "Application request not found" });
    }

    if (status === "accepted") {
      // Prevent exceeding max team size limit
      if (post.currentMemberCount >= post.maxMembers) {
        return res.status(400).json({
          message: "Cannot accept request: Team has reached maximum capacity limit.",
        });
      }

      reqItem.status = "accepted";
      post.currentMemberCount += 1;

      // Close post if full
      if (post.currentMemberCount >= post.maxMembers) {
        post.status = "Closed";
      }

      // If teamId exists in Team collection, add user
      if (post.team && reqItem.user?.id) {
        try {
          const teamDoc = await Team.findById(post.team);
          if (teamDoc) {
            teamDoc.members.push({
              user: reqItem.user.id,
              role: "member",
              responsibility: reqItem.roleRequested || "Team Member",
            });
            await teamDoc.save();
            await User.findByIdAndUpdate(reqItem.user.id, {
              $set: { teamId: post.team, role: "member" },
            });
          }
        } catch (teamErr) {
          console.error("Error updating team doc on accept:", teamErr);
        }
      }
    } else {
      reqItem.status = "rejected";
    }

    await post.save();

    res.json({
      message: `Request ${status} successfully`,
      currentMemberCount: post.currentMemberCount,
      status: post.status,
      requests: post.requests,
    });
  } catch (error) {
    console.error("Error resolving request:", error);
    res.status(500).json({ message: "Failed to update request status" });
  }
});

module.exports = router;

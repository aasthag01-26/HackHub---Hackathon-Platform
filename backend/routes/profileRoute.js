const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile.js");
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

    // Fallback using x-user-id / x-user-email for mock/dev sessions
    if (req.headers["x-user-id"] || req.headers["x-username"]) {
      req.user = {
        _id: req.headers["x-user-id"] || "demo-user-id",
        name: req.headers["x-user-name"] || "SriRam Kunamsetty",
        email: req.headers["x-user-email"] || "mohansriramkunamsetty@gmail.com",
        username: req.headers["x-username"] || "sriramkunamsetty",
      };
      return next();
    }

    return res.status(401).json({ message: "Not authorized, please log in" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

/**
 * @route   GET /api/profile/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    let profile = await Profile.findOne({
      $or: [{ user: userId }, { email: req.user.email }],
    });

    if (!profile) {
      // Auto-create initial profile for the user
      const defaultUsername = (req.user.name || "hacker")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20);

      profile = new Profile({
        user: req.user._id,
        username: defaultUsername || `user_${Date.now().toString().slice(-6)}`,
        fullName: req.user.name || "Student Developer",
        email: req.user.email || "",
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching current profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

/**
 * @route   PUT /api/profile/me
 * @desc    Update or initialize current user profile
 * @access  Private
 */
router.put("/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    let profile = await Profile.findOne({
      $or: [{ user: userId }, { email: req.user.email }],
    });

    const {
      username,
      fullName,
      headline,
      bio,
      avatarUrl,
      location,
      education,
      skills,
      domainsOfInterest,
      socialLinks,
      projects,
      hackathons,
      privacySettings,
    } = req.body;

    if (!profile) {
      profile = new Profile({
        user: userId,
        username: (username || req.user.name || "user")
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, ""),
        email: req.user.email,
      });
    }

    // Check unique username if username is changing
    if (username && username.toLowerCase() !== profile.username) {
      const existing = await Profile.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: profile._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Username is already taken by another student." });
      }
      profile.username = username.toLowerCase().trim();
    }

    if (fullName !== undefined) profile.fullName = fullName.trim();
    if (headline !== undefined) profile.headline = headline.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl.trim();
    if (location !== undefined) profile.location = location.trim();
    if (education) profile.education = education;
    if (socialLinks) profile.socialLinks = socialLinks;

    if (skills) {
      profile.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (domainsOfInterest) {
      profile.domainsOfInterest = Array.isArray(domainsOfInterest)
        ? domainsOfInterest.map((d) => d.trim()).filter(Boolean)
        : domainsOfInterest.split(",").map((d) => d.trim()).filter(Boolean);
    }

    if (projects && Array.isArray(projects)) {
      profile.projects = projects;
    }

    if (hackathons && Array.isArray(hackathons)) {
      profile.hackathons = hackathons;
    }

    if (privacySettings) {
      profile.privacySettings = {
        ...profile.privacySettings,
        ...privacySettings,
      };
    }

    const updated = await profile.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
});

/**
 * @route   GET /api/profile/:username
 * @desc    Get public student portfolio by username
 * @access  Public
 */
router.get("/:username", async (req, res) => {
  try {
    const target = req.params.username.toLowerCase().trim();
    const profile = await Profile.findOne({ username: target }).lean();

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Check if profile is private
    if (profile.privacySettings && profile.privacySettings.isPublic === false) {
      return res.status(403).json({ message: "This student profile is set to private." });
    }

    // Sanitize based on privacy settings
    const publicProfile = { ...profile };
    if (!publicProfile.privacySettings?.showEmail) {
      delete publicProfile.email;
    }
    if (!publicProfile.privacySettings?.showProjects) {
      publicProfile.projects = [];
    }
    if (!publicProfile.privacySettings?.showHackathons) {
      publicProfile.hackathons = [];
    }

    res.json(publicProfile);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Server error fetching portfolio" });
  }
});

/**
 * @route   GET /api/profile
 * @desc    Directory of public student profiles with skill/query filters
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { skill, domain, search } = req.query;
    const filter = { "privacySettings.isPublic": { $ne: false } };

    if (skill) {
      filter.skills = { $in: [new RegExp(skill, "i")] };
    }
    if (domain) {
      filter.domainsOfInterest = { $in: [new RegExp(domain, "i")] };
    }
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: regex },
        { username: regex },
        { headline: regex },
        { skills: regex },
      ];
    }

    const profiles = await Profile.find(filter)
      .select("username fullName headline avatarUrl skills domainsOfInterest socialLinks education")
      .limit(50)
      .lean();

    res.json(profiles);
  } catch (error) {
    console.error("Error browsing profiles:", error);
    res.status(500).json({ message: "Server error browsing directory" });
  }
});

module.exports = router;

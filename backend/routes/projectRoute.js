const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Project = require("../models/Project.js");
const User = require("../models/User.js");

// Optional auth middleware for public-readable routes
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (err) {
    // Continue without user
    req.user = null;
  }
  next();
};

// Require auth for publishing & updates
const requireAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = await User.findById(decoded.id).select("-password");
      if (req.user) return next();
    }
    // Also allow body/header fallback in development / mock mode
    if (req.body?.creator?.id || req.headers["x-user-id"]) {
      req.user = {
        _id: req.body?.creator?.id || req.headers["x-user-id"],
        name: req.body?.creator?.name || req.headers["x-user-name"] || "User",
        email: req.body?.creator?.email || "",
      };
      return next();
    }
    return res.status(401).json({ message: "Not authorized, please log in" });
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all public showcase projects with filters and search
 * @access  Public
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search, tech, sort } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (tech) {
      filter.techStack = { $in: [new RegExp(tech, "i")] };
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { tagline: regex },
        { description: regex },
        { techStack: regex },
        { teamName: regex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "popular") {
      sortOption = { likesCount: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const projects = await Project.find(filter).sort(sortOption).lean();

    // Attach user-specific like/bookmark status if user is present
    const currentUserId = req.user?._id?.toString();
    const formatted = projects.map((proj) => ({
      ...proj,
      isLiked: currentUserId
        ? proj.likes?.some((id) => id.toString() === currentUserId)
        : false,
      isBookmarked: currentUserId
        ? proj.bookmarks?.some((id) => id.toString() === currentUserId)
        : false,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching showcase projects:", error);
    res.status(500).json({ message: "Server error fetching projects" });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project details
 * @access  Public
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const currentUserId = req.user?._id?.toString();
    const result = project.toObject();
    result.isLiked = currentUserId
      ? project.likes.some((id) => id.toString() === currentUserId)
      : false;
    result.isBookmarked = currentUserId
      ? project.bookmarks.some((id) => id.toString() === currentUserId)
      : false;

    res.json(result);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error fetching project" });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Publish a project to showcase
 * @access  Private
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      tagline,
      description,
      category,
      techStack,
      githubUrl,
      liveDemoUrl,
      imageUrl,
      teamName,
      members,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Process tech stack (array of strings or comma-separated string)
    let processedStack = [];
    if (Array.isArray(techStack)) {
      processedStack = techStack.map((s) => s.trim()).filter(Boolean);
    } else if (typeof techStack === "string") {
      processedStack = techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Process members
    let processedMembers = [];
    if (Array.isArray(members)) {
      processedMembers = members.map((m) =>
        typeof m === "string" ? { name: m, role: "Member" } : m
      );
    }

    const newProject = new Project({
      title: title.trim(),
      tagline: tagline ? tagline.trim() : "",
      description: description.trim(),
      category: category || "Web Dev",
      techStack: processedStack,
      githubUrl: githubUrl ? githubUrl.trim() : "",
      liveDemoUrl: liveDemoUrl ? liveDemoUrl.trim() : "",
      imageUrl: imageUrl ? imageUrl.trim() : "",
      teamName: teamName ? teamName.trim() : "Independent Hacker",
      creator: {
        id: req.user._id,
        name: req.user.name || "Anonymous",
        email: req.user.email || "",
      },
      members: processedMembers,
      likes: [],
      likesCount: 0,
      bookmarks: [],
    });

    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating showcase project:", error);
    res.status(500).json({ message: error.message || "Failed to create project" });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project showcase
 * @access  Private
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const {
      title,
      tagline,
      description,
      category,
      techStack,
      githubUrl,
      liveDemoUrl,
      imageUrl,
      teamName,
      members,
    } = req.body;

    if (title) project.title = title.trim();
    if (tagline !== undefined) project.tagline = tagline.trim();
    if (description) project.description = description.trim();
    if (category) project.category = category;
    if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
    if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl.trim();
    if (imageUrl !== undefined) project.imageUrl = imageUrl.trim();
    if (teamName !== undefined) project.teamName = teamName.trim();

    if (techStack) {
      project.techStack = Array.isArray(techStack)
        ? techStack.map((s) => s.trim()).filter(Boolean)
        : techStack.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (members && Array.isArray(members)) {
      project.members = members.map((m) =>
        typeof m === "string" ? { name: m, role: "Member" } : m
      );
    }

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project showcase
 * @access  Private
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project removed from showcase successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

/**
 * @route   POST /api/projects/:id/like
 * @desc    Toggle like on a project
 * @access  Private
 */
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();
    const existingIndex = project.likes.findIndex(
      (id) => id.toString() === userId
    );

    let isLiked = false;
    if (existingIndex > -1) {
      // Unlike
      project.likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      // Like
      project.likes.push(req.user._id);
      isLiked = true;
    }

    project.likesCount = project.likes.length;
    await project.save();

    res.json({
      message: isLiked ? "Project liked" : "Project unliked",
      likesCount: project.likesCount,
      isLiked,
    });
  } catch (error) {
    console.error("Error liking project:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

/**
 * @route   POST /api/projects/:id/bookmark
 * @desc    Toggle bookmark on a project
 * @access  Private
 */
router.post("/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();
    const existingIndex = project.bookmarks.findIndex(
      (id) => id.toString() === userId
    );

    let isBookmarked = false;
    if (existingIndex > -1) {
      project.bookmarks.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      project.bookmarks.push(req.user._id);
      isBookmarked = true;
    }

    await project.save();

    res.json({
      message: isBookmarked ? "Project bookmarked" : "Bookmark removed",
      isBookmarked,
    });
  } catch (error) {
    console.error("Error bookmarking project:", error);
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

module.exports = router;

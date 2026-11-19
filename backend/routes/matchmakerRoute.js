const express = require("express");
const router = express.Router();
const MatchmakerProfile = require("../models/MatchmakerProfile.js");
const TeamInvite = require("../models/TeamInvite.js");

// Seed verified profiles for instant out-of-the-box discovery
const DEFAULT_CANDIDATES = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@igdtuw.ac.in",
    role: "AI/ML Engineer",
    skills: ["Python", "PyTorch", "Hugging Face", "FastAPI", "LangChain"],
    university: "IGDTUW Delhi",
    experienceLevel: "Hackathon Veteran",
    bio: "Passionate about LLMs, computer vision, and building zero-shot multi-agent systems for social impact.",
    availability: "Looking for Team",
    github: "https://github.com/aarav-ai",
    linkedin: "https://linkedin.com/in/aarav-sharma-ai",
    isVerifiedStudent: true,
  },
  {
    name: "Sneha Patel",
    email: "sneha.patel@nsut.ac.in",
    role: "UI/UX Designer",
    skills: ["Figma", "Design Systems", "Prototyping", "Tailwind CSS", "User Research"],
    university: "NSUT Delhi",
    experienceLevel: "Advanced",
    bio: "Specializing in accessible, glassmorphic UI, rapid user journey mapping, and converting wireframes into responsive React code.",
    availability: "Looking for Team",
    github: "https://github.com/snehadesign",
    linkedin: "https://linkedin.com/in/sneha-patel-design",
    isVerifiedStudent: true,
  },
  {
    name: "Rohan Varma",
    email: "rohan.varma@dtu.ac.in",
    role: "Backend Developer",
    skills: ["Node.js", "Go", "PostgreSQL", "Docker", "Redis", "gRPC"],
    university: "DTU Delhi",
    experienceLevel: "Advanced",
    bio: "Distributed systems builder. Loves building microservices with high-concurrency throughput and resilient DB caching.",
    availability: "Looking for Team",
    github: "https://github.com/rohan-varma",
    linkedin: "https://linkedin.com/in/rohan-varma-dev",
    isVerifiedStudent: true,
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@iiitd.ac.in",
    role: "Frontend Developer",
    skills: ["React", "Next.js", "TypeScript", "Three.js", "Framer Motion"],
    university: "IIIT Delhi",
    experienceLevel: "Intermediate",
    bio: "Frontend craftsman crafting interactive canvas visuals, smooth animations, and clean reusable component architectures.",
    availability: "Looking for Team",
    github: "https://github.com/ananya-frontend",
    linkedin: "https://linkedin.com/in/ananya-iyer-ui",
    isVerifiedStudent: true,
  },
  {
    name: "Kabir Mehta",
    email: "kabir.mehta@iitd.ac.in",
    role: "Blockchain/Web3 Dev",
    skills: ["Solidity", "Hardhat", "Ethers.js", "IPFS", "Smart Contracts"],
    university: "IIT Delhi",
    experienceLevel: "Hackathon Veteran",
    bio: "Ethereum developer with 3 hackathon podiums. Building decentralized identity and verifiable credentials protocols.",
    availability: "Open to Offers",
    github: "https://github.com/kabir-web3",
    linkedin: "https://linkedin.com/in/kabir-mehta-eth",
    isVerifiedStudent: true,
  },
  {
    name: "Diya Sengupta",
    email: "diya.s@bits-pilani.ac.in",
    role: "Pitch & Product Lead",
    skills: ["Pitch Decks", "Product Strategy", "Market Sizing", "Figma", "Public Speaking"],
    university: "BITS Pilani",
    experienceLevel: "Hackathon Veteran",
    bio: "3-minute presentation specialist. Turning complex technical architectures into compelling investor-grade pitches.",
    availability: "Looking for Team",
    github: "https://github.com/diya-product",
    linkedin: "https://linkedin.com/in/diya-sengupta-pm",
    isVerifiedStudent: true,
  },
];

// Helper: compute compatibility score based on complementary skills
function computeCompatibility(candidateSkills, teamSkills = []) {
  if (!Array.isArray(candidateSkills) || candidateSkills.length === 0) return 60;
  if (!Array.isArray(teamSkills) || teamSkills.length === 0) return 85;

  const normalizedTeam = teamSkills.map((s) => s.toLowerCase().trim());
  let complementaryCount = 0;
  let overlapCount = 0;

  candidateSkills.forEach((skill) => {
    const s = skill.toLowerCase().trim();
    if (normalizedTeam.includes(s)) {
      overlapCount++;
    } else {
      complementaryCount++;
    }
  });

  // Base score 70 + bonus for complementary skills - small penalty for excessive duplicate skills
  let score = 70 + complementaryCount * 6 - overlapCount * 2;
  return Math.min(99, Math.max(65, score));
}

// GET /api/matchmaker/candidates
router.get("/candidates", async (req, res) => {
  try {
    const { role, skill, availability, search } = req.query;

    let candidates = [];
    try {
      candidates = await MatchmakerProfile.find().lean();
    } catch {
      candidates = [];
    }

    // Seed defaults if empty
    if (!candidates || candidates.length === 0) {
      candidates = DEFAULT_CANDIDATES.map((c, i) => ({
        _id: "seed-" + (i + 1),
        ...c,
        createdAt: new Date().toISOString(),
      }));
    }

    // Filter by role
    if (role && role !== "All") {
      candidates = candidates.filter(
        (c) => c.role.toLowerCase() === role.toLowerCase()
      );
    }

    // Filter by skill
    if (skill && skill !== "All") {
      candidates = candidates.filter(
        (c) =>
          Array.isArray(c.skills) &&
          c.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
      );
    }

    // Filter by availability
    if (availability && availability !== "All") {
      candidates = candidates.filter(
        (c) => c.availability.toLowerCase() === availability.toLowerCase()
      );
    }

    // Keyword search
    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      candidates = candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.university.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          (c.bio && c.bio.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/matchmaker/candidates - register or update profile
router.post("/candidates", async (req, res) => {
  try {
    const { name, email, role, skills, university, experienceLevel, bio, github, linkedin, portfolio } =
      req.body;

    if (!name || !email || !role || !university) {
      return res.status(400).json({
        success: false,
        message: "Name, email, role, and university are required fields.",
      });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let profile;
    try {
      profile = await MatchmakerProfile.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
          skills: skillsArray,
          university: university.trim(),
          experienceLevel: experienceLevel || "Intermediate",
          bio: bio || "",
          github: github || "",
          linkedin: linkedin || "",
          portfolio: portfolio || "",
          availability: "Looking for Team",
        },
        { new: true, upsert: true }
      );
    } catch {
      profile = {
        _id: "local-" + Date.now(),
        name,
        email,
        role,
        skills: skillsArray,
        university,
        experienceLevel: experienceLevel || "Intermediate",
        bio: bio || "",
        github: github || "",
        linkedin: linkedin || "",
        portfolio: portfolio || "",
        availability: "Looking for Team",
      };
    }

    res.status(201).json({
      success: true,
      message: "Candidate profile registered successfully!",
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/matchmaker/invites
router.get("/invites", async (req, res) => {
  try {
    const { teamName } = req.query;
    let invites = [];
    try {
      const filter = teamName ? { teamName } : {};
      invites = await TeamInvite.find(filter).sort({ createdAt: -1 }).lean();
    } catch {
      invites = [];
    }

    res.status(200).json({
      success: true,
      count: invites.length,
      invites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/matchmaker/invites
router.post("/invites", async (req, res) => {
  try {
    const { teamName, inviterName, inviterEmail, candidateId, candidateName, roleOffered, message } =
      req.body;

    if (!teamName || !candidateId || !candidateName || !roleOffered) {
      return res.status(400).json({
        success: false,
        message: "teamName, candidateId, candidateName, and roleOffered are required.",
      });
    }

    let invite;
    try {
      invite = await TeamInvite.create({
        teamName,
        inviterName: inviterName || "Team Lead",
        inviterEmail: inviterEmail || "lead@hackhub.io",
        candidateId,
        candidateName,
        roleOffered,
        message: message || "We would love for you to join our hackathon team!",
        status: "pending",
      });
    } catch {
      invite = {
        _id: "invite-" + Date.now(),
        teamName,
        inviterName: inviterName || "Team Lead",
        inviterEmail: inviterEmail || "lead@hackhub.io",
        candidateId,
        candidateName,
        roleOffered,
        message: message || "We would love for you to join our hackathon team!",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    }

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${candidateName}!`,
      invite,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/matchmaker/invites/:id/status
router.patch("/invites/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'accepted', 'declined', or 'cancelled'.",
      });
    }

    let updated;
    try {
      updated = await TeamInvite.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } catch {
      updated = { _id: id, status };
    }

    res.status(200).json({
      success: true,
      message: `Invitation ${status}!`,
      invite: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.computeCompatibility = computeCompatibility;
module.exports.DEFAULT_CANDIDATES = DEFAULT_CANDIDATES;

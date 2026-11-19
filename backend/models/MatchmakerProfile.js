const mongoose = require("mongoose");

const matchmakerProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "AI/ML Engineer",
        "UI/UX Designer",
        "Mobile App Developer",
        "Blockchain/Web3 Dev",
        "Pitch & Product Lead",
      ],
      default: "Full Stack Developer",
    },
    skills: {
      type: [String],
      required: true,
      default: [],
    },
    university: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Hackathon Veteran"],
      default: "Intermediate",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    availability: {
      type: String,
      enum: ["Looking for Team", "Open to Offers", "Team Formed"],
      default: "Looking for Team",
    },
    github: {
      type: String,
      trim: true,
      default: "",
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    portfolio: {
      type: String,
      trim: true,
      default: "",
    },
    isVerifiedStudent: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MatchmakerProfile ||
  mongoose.model("MatchmakerProfile", matchmakerProfileSchema);

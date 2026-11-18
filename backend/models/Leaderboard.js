const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    hackathonName: {
      type: String,
      default: "HackHub Global Hackathon 2026",
      trim: true,
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    track: {
      type: String,
      enum: [
        "All",
        "AI / ML",
        "Web3 & Blockchain",
        "FinTech",
        "Healthcare",
        "Open Innovation",
        "Cybersecurity",
        "EdTech",
      ],
      default: "Open Innovation",
    },
    scores: {
      innovation: {
        type: Number,
        min: 0,
        max: 25,
        default: 0,
      },
      technical: {
        type: Number,
        min: 0,
        max: 25,
        default: 0,
      },
      design: {
        type: Number,
        min: 0,
        max: 25,
        default: 0,
      },
      presentation: {
        type: Number,
        min: 0,
        max: 25,
        default: 0,
      },
      totalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    rank: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["winner", "finalist", "shortlisted", "participating"],
      default: "participating",
    },
    medal: {
      type: String,
      enum: ["gold", "silver", "bronze", "none"],
      default: "none",
    },
    judgeFeedback: {
      type: String,
      default: "",
      trim: true,
    },
    judgedBy: {
      type: String,
      default: "Chief Evaluation Panel",
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totalScore
leaderboardSchema.pre("save", function (next) {
  if (this.scores) {
    const inv = Number(this.scores.innovation) || 0;
    const tech = Number(this.scores.technical) || 0;
    const des = Number(this.scores.design) || 0;
    const pres = Number(this.scores.presentation) || 0;
    this.scores.totalScore = Math.min(100, Math.max(0, inv + tech + des + pres));
  }
  next();
});

const Leaderboard =
  mongoose.models.Leaderboard ||
  mongoose.model("Leaderboard", leaderboardSchema);

module.exports = Leaderboard;

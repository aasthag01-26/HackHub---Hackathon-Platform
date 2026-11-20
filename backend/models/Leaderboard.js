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
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "Open Innovation",
      enum: [
        "Open Innovation",
        "Web & Cloud",
        "AI / ML",
        "FinTech",
        "HealthTech",
        "Cybersecurity",
        "EdTech",
      ],
    },
    scores: {
      innovation: { type: Number, min: 0, max: 25, default: 0 },
      technical: { type: Number, min: 0, max: 25, default: 0 },
      presentation: { type: Number, min: 0, max: 25, default: 0 },
      impact: { type: Number, min: 0, max: 25, default: 0 },
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rank: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Winner", "Finalist", "Shortlisted", "Participant"],
      default: "Participant",
    },
    award: {
      type: String,
      default: "None",
      trim: true,
    },
    judgeNotes: {
      type: String,
      default: "",
      trim: true,
    },
    evaluatedBy: {
      type: String,
      default: "Judging Panel",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to automatically calculate totalScore from criteria
leaderboardSchema.pre("save", function (next) {
  if (this.scores) {
    const { innovation = 0, technical = 0, presentation = 0, impact = 0 } = this.scores;
    this.totalScore = Number((innovation + technical + presentation + impact).toFixed(1));
  }
  next();
});

leaderboardSchema.index({ totalScore: -1, rank: 1 });
leaderboardSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Leaderboard", leaderboardSchema);

const mongoose = require("mongoose");

const feedbackItemSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mentorName: {
    type: String,
    default: "Mentor",
  },
  givenBy: {
    type: String,
    default: "Assigned Mentor",
  },
  milestone: {
    type: String,
    required: true,
    enum: [
      "Initial Project Ideation",
      "System Architecture Review",
      "MVP Demo & Code Quality",
      "Final Pitch & Deployment Review",
    ],
    default: "MVP Demo & Code Quality",
  },
  feedback: {
    type: String,
    trim: true,
    default: "",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  strengths: {
    type: String,
    trim: true,
    default: "",
  },
  areasForImprovement: {
    type: String,
    trim: true,
    default: "",
  },
  recommendations: {
    type: String,
    trim: true,
    default: "",
  },
});

const mentorshipRequestSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: false,
    },
    mentorId: {
      type: String,
      trim: true,
      default: "",
    },
    mentorName: {
      type: String,
      required: true,
      trim: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: false,
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    requesterName: {
      type: String,
      default: "Team Lead",
    },
    requesterEmail: {
      type: String,
      default: "",
    },
    projectName: {
      type: String,
      trim: true,
      default: "",
    },
    projectTitle: {
      type: String,
      trim: true,
      default: "",
    },
    projectDescription: {
      type: String,
      trim: true,
      default: "",
    },
    requestMessage: {
      type: String,
      trim: true,
      default: "",
    },
    guidanceNeeded: {
      type: String,
      trim: true,
      default: "",
    },
    domain: {
      type: String,
      trim: true,
      default: "Web Dev",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    
    projectRepoUrl: {
      type: String,
      default: "",
    },
    projectDemoUrl: {
      type: String,
      default: "",
    },
    feedbackHistory: [feedbackItemSchema],
  },
  {
    timestamps: true,
  }
);

mentorshipRequestSchema.index({ mentor: 1, status: 1 });
mentorshipRequestSchema.index({ teamName: 1 });

const MentorshipRequest =
  mongoose.models.MentorshipRequest ||
  mongoose.model("MentorshipRequest", mentorshipRequestSchema);

module.exports = MentorshipRequest;

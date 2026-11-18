const mongoose = require("mongoose");

const feedbackItemSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  mentorName: {
    type: String,
    default: "Mentor",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  strengths: {
    type: String,
    required: true,
    trim: true,
  },
  areasForImprovement: {
    type: String,
    required: true,
    trim: true,
  },
  recommendations: {
    type: String,
    required: true,
    trim: true,
  },
});

const mentorshipRequestSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: false,
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
      required: true,
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
    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      default: "Web Dev",
    },
    guidanceNeeded: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    feedbackHistory: [feedbackItemSchema],
  },
  {
    timestamps: true,
  }
);

mentorshipRequestSchema.index({ mentor: 1, status: 1 });
mentorshipRequestSchema.index({ teamName: 1 });

module.exports = mongoose.model("MentorshipRequest", mentorshipRequestSchema);

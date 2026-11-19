const mongoose = require("mongoose");

const organizerHackathonSchema = new mongoose.Schema(
  {
    organizerId: {
      type: String,
      required: true,
      index: true,
    },
    organizerName: {
      type: String,
      default: "HackHub Organizer",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "Build the future of technology.",
    },
    description: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Virtual", "In-Person", "Hybrid"],
      default: "Virtual",
    },
    location: {
      type: String,
      default: "Online",
    },
    prizePool: {
      type: String,
      default: "$10,000",
    },
    tracks: {
      type: [String],
      default: ["AI & Machine Learning", "Web & Mobile", "Open Innovation"],
    },
    rounds: [
      {
        roundNumber: { type: Number, required: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },
        deadline: { type: Date, required: true },
        status: {
          type: String,
          enum: ["Upcoming", "Active", "Evaluating", "Completed"],
          default: "Upcoming",
        },
      },
    ],
    rubrics: [
      {
        criterion: { type: String, required: true },
        weight: { type: Number, default: 25 },
        maxPoints: { type: Number, default: 25 },
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Published", "Active", "Judging", "Concluded"],
      default: "Published",
    },
    registeredTeamsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrganizerHackathon", organizerHackathonSchema);

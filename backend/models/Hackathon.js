const mongoose = require("mongoose");

const prizeSchema = new mongoose.Schema({
  place: { type: String, required: true },
  reward: { type: String, required: true },
  description: { type: String, default: "" },
});

const timelineSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  date: { type: String, required: true },
  details: { type: String, default: "" },
});

const registrationItemSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  teamName: { type: String, required: true },
  leadUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  leadName: { type: String, default: "Team Leader" },
  leadEmail: { type: String, default: "" },
  membersCount: { type: Number, default: 1 },
  projectTitle: { type: String, default: "" },
  projectTrack: { type: String, default: "General" },
  registeredAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Registered", "Under Review", "Accepted", "Rejected"],
    default: "Registered",
  },
});

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hackathon title is required"],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      default: "HackHub Global",
    },
    domain: {
      type: String,
      enum: [
        "All Domains",
        "AI / ML",
        "Web3 & Blockchain",
        "Cloud & DevOps",
        "FinTech",
        "HealthTech",
        "Cybersecurity",
        "Open Innovation",
        "EdTech",
      ],
      default: "Open Innovation",
    },
    mode: {
      type: String,
      enum: ["Online", "In-Person", "Hybrid"],
      default: "Online",
    },
    location: {
      type: String,
      trim: true,
      default: "Virtual / Global",
    },
    prizePool: {
      type: String,
      default: "$10,000",
      trim: true,
    },
    prizes: [prizeSchema],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
    eligibility: {
      type: String,
      default: "Open to all undergraduate, graduate, and high school students worldwide.",
    },
    rules: [{ type: String, trim: true }],
    timeline: [timelineSchema],
    imageUrl: {
      type: String,
      default: "",
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    registrations: [registrationItemSchema],
  },
  {
    timestamps: true,
  }
);

hackathonSchema.index({ domain: 1, mode: 1, status: 1 });
hackathonSchema.index({ registrationDeadline: 1 });
hackathonSchema.index({ title: "text", description: "text", organizer: "text" });

module.exports = mongoose.model("Hackathon", hackathonSchema);

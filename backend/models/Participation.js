const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["leader", "member"],
      default: "member",
    },
  },
  { _id: false }
);

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedAt: Date,
  },
  { timestamps: true }
);

const participationSchema = new mongoose.Schema(
  {
    hackathonName: { type: String, required: true, trim: true },
    hackathonKey: { type: String, required: true, lowercase: true, trim: true },
    mode: { type: String, enum: ["individual", "team"], required: true },
    teamName: { type: String, trim: true },
    existingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: { type: [memberSchema], required: true },
    invitations: { type: [invitationSchema], default: [] },
    project: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      repositoryUrl: { type: String, default: "" },
      demoUrl: { type: String, default: "" },
    },
    registrationStatus: {
      type: String,
      enum: ["registered"],
      default: "registered",
    },
    participationStatus: {
      type: String,
      enum: ["registered", "in_progress", "completed"],
      default: "registered",
    },
  },
  { timestamps: true }
);

participationSchema.index(
  { hackathonKey: 1, "members.user": 1 },
  { unique: true }
);

module.exports = mongoose.model("Participation", participationSchema);

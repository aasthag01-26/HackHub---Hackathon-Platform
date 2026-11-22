const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"],
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [140, "Headline cannot exceed 140 characters"],
      default: "Student Developer & Hackathon Participant",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    education: {
      institution: { type: String, trim: true, default: "" },
      degree: { type: String, trim: true, default: "" },
      graduationYear: { type: String, trim: true, default: "" },
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    domainsOfInterest: [
      {
        type: String,
        trim: true,
      },
    ],
    socialLinks: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
    },
    projects: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        techStack: [{ type: String, trim: true }],
        projectUrl: { type: String, trim: true, default: "" },
        githubUrl: { type: String, trim: true, default: "" },
      },
    ],
    hackathons: [
      {
        name: { type: String, required: true, trim: true },
        role: { type: String, trim: true, default: "Hacker" },
        achievement: { type: String, trim: true, default: "Participant" },
        year: { type: String, trim: true, default: "" },
      },
    ],
    privacySettings: {
      isPublic: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showHackathons: { type: Boolean, default: true },
      showProjects: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ username: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ domainsOfInterest: 1 });

module.exports = mongoose.model("Profile", profileSchema);

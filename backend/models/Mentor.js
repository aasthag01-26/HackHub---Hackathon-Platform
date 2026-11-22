const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: [true, "Mentor name is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Professional title is required"],
      trim: true,
      default: "Senior Technical Mentor",
    },
    company: {
      type: String,
      trim: true,
      default: "Tech Industry Mentor",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    domains: 
      {
        type: [String],
        // trim: true,
        default: ["Open Innovation"],
      },
    expertise: 
      {
        type: [String],
        // trim: true,
        default: [],
      },
    skills: {
      type: [String],
      default: [],
    },
    availableSlots: {
      type: Number,
      default: 5,
      min: 0,
    },
    experienceYears: {
      type: Number,
      min: 1,
      default: 3,
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
    },
    contactEmail: {
      type: String,
      // required: [true, "Contact email is required"],
      trim: true,
      default: "",
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
    },
    
  },
  {
    timestamps: true,
  }
);

mentorSchema.index({ domains: 1 });
mentorSchema.index({ expertise: 1 });

const Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

module.exports = Mentor;

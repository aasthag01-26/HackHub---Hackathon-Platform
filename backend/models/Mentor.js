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
    domains: [
      {
        type: String,
        trim: true,
      },
    ],
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    availableSlots: {
      type: Number,
      default: 5,
      min: 0,
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

module.exports = mongoose.model("Mentor", mentorSchema);

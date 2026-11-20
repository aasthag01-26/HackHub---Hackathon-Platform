const mongoose = require("mongoose");

const teamRecruitmentSchema = new mongoose.Schema(
  {
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
    teamLeader: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, default: "Team Leader" },
      email: { type: String, default: "" },
    },
    projectTitle: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    projectDescription: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    domain: {
      type: String,
      default: "Web Dev",
      enum: [
        "Web Dev",
        "AI / ML",
        "Mobile App",
        "Blockchain / Web3",
        "Cloud / DevOps",
        "Cybersecurity",
        "FinTech",
        "HealthTech",
        "EdTech",
        "Open Innovation",
      ],
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    openRoles: [
      {
        roleTitle: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
      },
    ],
    currentMemberCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxMembers: {
      type: Number,
      default: 4,
      min: 2,
      max: 6,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    requests: [
      {
        user: {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          name: { type: String, default: "Student Hacker" },
          email: { type: String, default: "" },
          skills: [{ type: String, trim: true }],
        },
        roleRequested: { type: String, default: "Team Member" },
        message: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

teamRecruitmentSchema.index({ domain: 1, status: 1 });
teamRecruitmentSchema.index({ requiredSkills: 1 });
teamRecruitmentSchema.index({ projectTitle: "text", projectDescription: "text", teamName: "text" });

module.exports = mongoose.model("TeamRecruitment", teamRecruitmentSchema);

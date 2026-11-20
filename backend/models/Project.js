const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, "Tagline cannot exceed 200 characters"],
      default: "",
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Web Dev",
        "AI / ML",
        "Mobile App",
        "Blockchain / Web3",
        "Cloud / DevOps",
        "Open Source",
        "HealthTech",
        "FinTech",
        "EdTech",
        "IoT & Hardware",
        "Other",
      ],
      default: "Web Dev",
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    teamName: {
      type: String,
      trim: true,
      default: "Independent Hacker",
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    creator: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: {
        type: String,
        default: "Anonymous",
      },
      email: {
        type: String,
        default: "",
      },
    },
    members: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true, default: "Contributor" },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-speed showcase search and filtering
projectSchema.index({ category: 1, createdAt: -1 });
projectSchema.index({ likesCount: -1 });
projectSchema.index({ title: "text", description: "text", techStack: "text" });

module.exports = mongoose.model("Project", projectSchema);

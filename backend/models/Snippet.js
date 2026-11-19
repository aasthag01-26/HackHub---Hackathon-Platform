const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      default: "general",
      index: true,
    },
    authorName: {
      type: String,
      default: "Hacker",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["typescript", "javascript", "python", "css", "html", "sql", "json"],
      default: "typescript",
    },
    code: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Snippet", snippetSchema);

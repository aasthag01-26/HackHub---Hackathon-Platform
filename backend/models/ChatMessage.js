const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ team: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);

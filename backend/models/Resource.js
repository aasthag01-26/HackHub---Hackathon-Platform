const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Documentation', 'Dataset', 'Tutorial', 'API Reference', 'Design', 'Other'],
      default: 'Documentation',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedByName: {
      type: String,
      default: 'Teammate',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);

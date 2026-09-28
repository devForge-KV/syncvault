const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deliverableUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'in-review', 'approved'],
      default: 'pending',
    },
    clientFeedback: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    dueDate: Date,
    approvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Milestone', milestoneSchema);
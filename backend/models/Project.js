const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
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
    type: {
      type: String,
      enum: ['link', 'figma', 'video', 'drive', 'github'],
      default: 'link',
    },
    addedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: String,
      role: {
        type: String,
        enum: ['agency', 'client'],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'in-review', 'completed'],
      default: 'active',
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startDate: Date,
    deadline: Date,
    resources: {
      type: [resourceSchema],
      default: [],
    },
    activities: {
      type: [
        {
          text: String,
          actionType: {
            type: String,
            enum: ['project_created', 'milestone_approved', 'resource_added', 'feedback_given'],
          },
          performedBy: {
            name: String,
            role: String,
          },
          feedback: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.virtual('milestones', {
  ref: 'Milestone',
  localField: '_id',
  foreignField: 'projectId',
});

module.exports = mongoose.model('Project', projectSchema);
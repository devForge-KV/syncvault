const mongoose = require('mongoose');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const {
  getAccessibleProject,
  recalculateProjectProgress,
} = require('./projectController');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const addMilestone = async (req, res, next) => {
  try {
    const { projectId, title, description, deliverableUrl, dueDate } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ message: 'projectId and title are required' });
    }

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }

    const project = await Project.findOne({
      _id: projectId,
      agencyId: req.user._id,
    }).select('_id');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const milestone = await Milestone.create({
      projectId: project._id,
      title,
      description,
      deliverableUrl,
      dueDate,
    });

    const overallProgress = await recalculateProjectProgress(project._id);

    return res.status(201).json({ milestone, overallProgress });
  } catch (error) {
    return next(error);
  }
};

const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { status, feedback, clientFeedback, deliverableUrl } = req.body;
    const feedbackText = feedback ?? clientFeedback;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid milestone ID' });
    }

    const milestone = await Milestone.findById(req.params.id).populate({
      path: 'projectId',
      select: 'agencyId clientId activities',
    });

    if (!milestone || !milestone.projectId) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const project = milestone.projectId;
    const isAgencyOwner = req.user.role === 'agency'
      && project.agencyId.equals(req.user._id);
    const isAssignedClient = req.user.role === 'client'
      && project.clientId.equals(req.user._id);

    if (!isAgencyOwner && !isAssignedClient) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    if (isAssignedClient) {
      if (status !== 'approved') {
        return res.status(400).json({
          message: 'Clients can only mark milestones as approved',
        });
      }

      milestone.status = 'approved';
      if (feedbackText !== undefined) {
        milestone.feedback = feedbackText;
        milestone.clientFeedback = feedbackText;
      }
    } else {
      if (status !== undefined) {
        milestone.status = status;
      }
      if (deliverableUrl !== undefined) {
        milestone.deliverableUrl = deliverableUrl;
      }
    }

    if (milestone.status === 'approved') {
      milestone.approvedAt = milestone.approvedAt || new Date();
    } else {
      milestone.approvedAt = undefined;
    }

    await milestone.save();
    if (isAssignedClient && status === 'approved') {
      const activityText = feedbackText && feedbackText.trim()
        ? `Client approved '${milestone.title}' with feedback: "${feedbackText}"`
        : `Milestone '${milestone.title}' was approved by Client`;
      project.activities.push({
        text: activityText,
        actionType: 'milestone_approved',
        performedBy: {
          name: req.user.name,
          role: req.user.role,
        },
        feedback: feedbackText && feedbackText.trim() ? feedbackText : undefined,
      });
    }
    if (isAssignedClient && status !== 'approved' && typeof feedbackText === 'string' && feedbackText.trim()) {
      project.activities.push({
        text: `Feedback added on milestone '${milestone.title}' by Client`,
        actionType: 'feedback_given',
        performedBy: {
          name: req.user.name,
          role: req.user.role,
        },
        feedback: feedbackText,
      });
    }
    if (project.isModified('activities')) {
      await project.save();
    }
    await recalculateProjectProgress(project._id);

    return res.json({ milestone });
  } catch (error) {
    return next(error);
  }
};

const getProjectMilestones = async (req, res, next) => {
  try {
    const project = await getAccessibleProject(req.params.projectId, req.user);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const milestones = await Milestone.find({ projectId: project._id })
      .sort({ dueDate: 1, createdAt: 1 });

    return res.json({ milestones });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addMilestone,
  updateMilestoneStatus,
  getProjectMilestones,
};

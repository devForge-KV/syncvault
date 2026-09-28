const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Milestone = require('../models/Milestone');
const sendEmail = require('../utils/sendEmail');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const projectAccessFilter = (userId, role) => (
  role === 'agency' ? { agencyId: userId } : { clientId: userId }
);

const getAccessibleProject = (projectId, user) => {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  return Project.findOne({
    _id: projectId,
    ...projectAccessFilter(user._id, user.role),
  });
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description, budget, deadline } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.user._id },
      { $set: { title, description, budget, deadline } },
      { new: true, runValidators: true }
    )
      .populate('agencyId', 'name')
      .populate('clientId', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({ project });
  } catch (error) {
    return next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      agencyId: req.user._id,
    }).select('_id');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Promise.all([
      Milestone.deleteMany({ projectId: project._id }),
      Project.deleteOne({ _id: project._id }),
    ]);

    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const addProjectResource = async (req, res, next) => {
  try {
    const { title, url, type } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    const project = await getAccessibleProject(req.params.id, req.user);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.resources.push({
      title,
      url,
      type,
      addedBy: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });
    const resource = project.resources[project.resources.length - 1];
    project.activities.push({
      text: `New ${resource.type} resource '${title}' uploaded by ${req.user.role}`,
      actionType: 'resource_added',
      performedBy: {
        name: req.user.name,
        role: req.user.role,
      },
    });
    await project.save();

    return res.status(201).json({ resource, activities: project.activities });
  } catch (error) {
    return next(error);
  }
};

const deleteProjectResource = async (req, res, next) => {
  try {
    const project = await getAccessibleProject(req.params.id, req.user);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const resource = project.resources.id(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.deleteOne();
    await project.save();

    return res.json({ message: 'Resource deleted' });
  } catch (error) {
    return next(error);
  }
};

const addProjectActivity = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const project = await getAccessibleProject(req.params.id, req.user);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.activities.push({
      text: `Client sent an urgent query: "${message.trim()}"`,
      actionType: 'feedback_given',
      performedBy: { name: req.user.name, role: req.user.role },
      feedback: message.trim(),
    });
    await project.save();

    return res.status(201).json({ activity: project.activities[project.activities.length - 1], activities: project.activities });
  } catch (error) {
    return next(error);
  }
};

const recalculateProjectProgress = async (projectId) => {
  const [totalMilestones, approvedMilestones] = await Promise.all([
    Milestone.countDocuments({ projectId }),
    Milestone.countDocuments({ projectId, status: 'approved' }),
  ]);
  const overallProgress = totalMilestones === 0
    ? 0
    : Math.round((approvedMilestones / totalMilestones) * 100);

  await Project.updateOne({ _id: projectId }, { $set: { overallProgress } });

  return overallProgress;
};

const createProject = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.plan === 'starter') {
      const projectCount = await Project.countDocuments({ agencyId: req.user._id });

      if (projectCount >= 3) {
        return res.status(403).json({
          success: false,
          message: 'Starter tier limit reached (Max 3 active projects). Upgrade to Agency Pro for unlimited projects.',
        });
      }
    }

    const {
      title,
      description,
      clientEmail,
      budget,
      deadline,
      milestoneTitle,
      milestoneDescription,
      milestoneDueDate,
    } = req.body;

    if (!title || !clientEmail) {
      return res.status(400).json({ message: 'Title and clientEmail are required' });
    }

    const clientUser = await User.findOne({ email: clientEmail.toLowerCase().trim() });

    if (!clientUser) {
      return res.status(404).json({
        message: 'No registered client found with this email. Please ask the client to register first.',
      });
    }

    const project = await Project.create({
      title,
      description,
      agencyId: req.user._id,
      clientId: clientUser._id,
      budget,
      deadline,
      activities: [{
        text: 'Project workspace initialized by Agency',
        actionType: 'project_created',
        performedBy: {
          name: req.user.name,
          role: req.user.role,
        },
      }],
    });

    if (milestoneTitle) {
      await Milestone.create({
        projectId: project._id,
        title: milestoneTitle,
        description: milestoneDescription,
        dueDate: milestoneDueDate,
      });
    }

    await project.populate([
      { path: 'agencyId', select: 'name' },
      { path: 'clientId', select: 'name' },
    ]);

    const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client-portal`;
    sendEmail({
      to: clientUser.email,
      subject: 'Welcome to SyncVault: Your Project Workspace is Live!',
      html: `<div style="margin:0;background:#0f1210;padding:40px 20px;font-family:Arial,sans-serif;color:#f0f2ed"><div style="max-width:560px;margin:0 auto;border:1px solid #343a36;background:#191c1b;padding:36px"><div style="color:#d9f36a;font-size:13px;font-weight:700;letter-spacing:3px">SYNCVAULT</div><h1 style="margin:28px 0 10px;color:#f0f2ed;font-size:28px">Your workspace is live.</h1><p style="margin:0 0 24px;color:#8c958d;line-height:1.7">${escapeHtml(req.user.name)} has created <strong style="color:#f0f2ed">${escapeHtml(title)}</strong> for your collaboration.</p><p style="color:#c6cdc5;line-height:1.7">Your agency workspace has been activated. You can track progress, review milestones, and access shared vault resources.</p><a href="${escapeHtml(portalUrl)}" style="display:inline-block;margin-top:18px;background:#d9f36a;color:#111312;padding:14px 20px;text-decoration:none;font-weight:700">Open Client Portal</a></div></div>`,
    }).catch((emailError) => {
      console.error('Project welcome email failed:', emailError.message);
    });

    return res.status(201).json({ project });
  } catch (error) {
    return next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find(projectAccessFilter(req.user._id, req.user.role))
      .populate('agencyId', 'name companyName email')
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });

    return res.json({ projects, user: { plan: req.user.plan } });
  } catch (error) {
    return next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await getAccessibleProject(req.params.id, req.user);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.populate([
      { path: 'agencyId', select: 'name companyName email' },
      { path: 'clientId', select: 'name' },
      { path: 'milestones' },
    ]);

    return res.json({ project });
  } catch (error) {
    return next(error);
  }
};

const updateProjectProgress = async (req, res, next) => {
  try {
    const project = await getAccessibleProject(req.params.id, req.user);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const overallProgress = await recalculateProjectProgress(project._id);

    return res.json({
      projectId: project._id,
      overallProgress,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  addProjectResource,
  deleteProjectResource,
  addProjectActivity,
  getProjects,
  getProjectById,
  updateProjectProgress,
  getAccessibleProject,
  recalculateProjectProgress,
};

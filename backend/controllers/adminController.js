const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');

const PLAN_PRICES_USD = { starter: 29, agency_pro: 79, enterprise: 199 };
const ALLOWED_PLANS = Object.keys(PLAN_PRICES_USD);
const ACTIVE_PROJECT_STATUSES = ['active', 'in_progress'];

const getAgenciesList = () => User.aggregate([
  { $match: { role: 'agency' } },
  {
    $lookup: {
      from: Project.collection.name,
      let: { agencyId: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$agencyId', '$$agencyId'] } } },
        { $match: { status: { $in: ACTIVE_PROJECT_STATUSES } } },
        { $count: 'count' },
      ],
      as: 'activeProjectCounts',
    },
  },
  {
    $project: {
      name: 1,
      email: 1,
      plan: 1,
      createdAt: 1,
      projectCount: { $ifNull: [{ $arrayElemAt: ['$activeProjectCounts.count', 0] }, 0] },
    },
  },
  { $sort: { createdAt: -1 } },
]);

const getMetrics = async (req, res, next) => {
  try {
    const [
      totalAgencies,
      totalProjects,
      activeClientProjects,
      starterCount,
      agencyProCount,
      enterpriseCount,
      agenciesList,
      recentAgencies,
      recentPlanChanges,
    ] = await Promise.all([
      User.countDocuments({ role: 'agency' }),
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ACTIVE_PROJECT_STATUSES } }),
      User.countDocuments({ role: 'agency', plan: 'starter' }),
      User.countDocuments({ role: 'agency', plan: 'agency_pro' }),
      User.countDocuments({ role: 'agency', plan: 'enterprise' }),
      getAgenciesList(),
      User.find({ role: 'agency' })
        .select('name email plan createdAt')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      User.find({ role: 'agency', planUpdatedAt: { $exists: true } })
        .select('name email plan planUpdatedAt')
        .sort({ planUpdatedAt: -1 })
        .limit(8)
        .lean(),
    ]);

    const planCounts = {
      starter: starterCount,
      agency_pro: agencyProCount,
      enterprise: enterpriseCount,
    };
    const totalMRR = (starterCount * PLAN_PRICES_USD.starter)
      + (agencyProCount * PLAN_PRICES_USD.agency_pro)
      + (enterpriseCount * PLAN_PRICES_USD.enterprise);

    return res.json({
      totalAgencies,
      totalProjects,
      activeClientProjects,
      planCounts,
      totalMRR,
      agenciesList,
      recentActivity: [
        ...recentAgencies.map((agency) => ({
          id: `${agency._id}-registered`,
          name: agency.name,
          email: agency.email,
          plan: agency.plan,
          createdAt: agency.createdAt,
          type: 'agency_registered',
        })),
        ...recentPlanChanges.map((agency) => ({
          id: `${agency._id}-plan-${agency.planUpdatedAt.getTime()}`,
          name: agency.name,
          email: agency.email,
          plan: agency.plan,
          createdAt: agency.planUpdatedAt,
          type: 'plan_changed',
        })),
      ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).slice(0, 10),
    });
  } catch (error) {
    return next(error);
  }
};

const getAgencies = async (req, res, next) => {
  try {
    const agencies = await getAgenciesList();

    return res.json({ agencies });
  } catch (error) {
    return next(error);
  }
};

const updateAgencyPlan = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid agency ID' });
    }

    const { plan } = req.body || {};
    if (!ALLOWED_PLANS.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const agency = await User.findOne({ _id: req.params.id, role: 'agency' })
      .select('name companyName email plan createdAt planUpdatedAt');

    if (!agency) return res.status(404).json({ message: 'Agency not found' });
    if (agency.plan !== plan) {
      agency.plan = plan;
      agency.planUpdatedAt = new Date();
      await agency.save();
    }

    return res.json({ success: true, agency });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMetrics, getAgencies, updateAgencyPlan };
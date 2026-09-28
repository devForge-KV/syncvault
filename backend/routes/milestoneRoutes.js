const express = require('express');
const {
  addMilestone,
  updateMilestoneStatus,
  getProjectMilestones,
} = require('../controllers/milestoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', authorize('agency'), addMilestone);
router.get(
  '/project/:projectId',
  authorize('agency', 'client'),
  getProjectMilestones
);
router.patch(
  '/:id/status',
  authorize('agency', 'client'),
  updateMilestoneStatus
);

module.exports = router;

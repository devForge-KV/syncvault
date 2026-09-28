const express = require('express');
const { getMetrics, getAgencies, updateAgencyPlan } = require('../controllers/adminController');
const { protect, requireSuperAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireSuperAdmin);
router.get('/metrics', getMetrics);
router.get('/agencies', getAgencies);
router.put('/user/:id/plan', updateAgencyPlan);

module.exports = router;
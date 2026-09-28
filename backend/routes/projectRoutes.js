const express = require('express');
const {
  createProject,
  updateProject,
  deleteProject,
  addProjectResource,
  deleteProjectResource,
  addProjectActivity,
  getProjects,
  getProjectById,
  updateProjectProgress,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .post(authorize('agency'), createProject)
  .get(authorize('agency', 'client'), getProjects);
router.put('/:id', authorize('agency'), updateProject);
router.delete('/:id', authorize('agency'), deleteProject);
router.post('/:id/resources', authorize('agency', 'client'), addProjectResource);
router.delete('/:id/resources/:resourceId', authorize('agency', 'client'), deleteProjectResource);
router.post('/:id/activities', authorize('client'), addProjectActivity);
router.get('/:id', authorize('agency', 'client'), getProjectById);
router.put(
  '/:id/progress',
  authorize('agency', 'client'),
  updateProjectProgress
);

module.exports = router;

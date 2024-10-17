const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStatistic
} = require('../controllers/jobController');

router.post('/api/job', authenticateToken, authorizeRole(['owner']), createJob);
router.get('/api/job', authenticateToken, getAllJobs);
router.get('/api/job/:id', authenticateToken, getJobById);
router.get('/api/job/statistic/:year', authenticateToken, getJobStatistic);
router.put('/api/job/:id', authenticateToken, authorizeRole(['owner']), updateJob);
router.delete('/api/job/:id', authenticateToken, authorizeRole(['owner']), deleteJob);

module.exports = router;

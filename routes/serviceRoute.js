const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
} = require('../controllers/serviceController');

router.post('/api/service', authenticateToken, authorizeRole(['owner']), createService);
router.get('/api/service', authenticateToken, getAllServices);
router.get('/api/service/:id', authenticateToken, getServiceById);
router.put('/api/service/:id', authenticateToken, authorizeRole(['owner']), updateService);
router.delete('/api/service/:id', authenticateToken, authorizeRole(['owner']), deleteService);

module.exports = router;

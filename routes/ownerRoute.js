const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createOwner,
  createDefaultOwner,
  getAllOwners,
  getOwnerById,
  updateOwner,
  deleteOwner
} = require('../controllers/ownerController');

router.post('/api/owner', authenticateToken, authorizeRole(['owner']), createOwner);
router.post('/api/owner/default', createDefaultOwner);
router.get('/api/owner', authenticateToken, authorizeRole(['owner']), getAllOwners);
router.get('/api/owner/:id', authenticateToken, authorizeRole(['owner']), getOwnerById);
router.put('/api/owner/:id', authenticateToken, authorizeRole(['owner']), updateOwner);
router.delete('/api/owner/:id', authenticateToken, authorizeRole(['owner']), deleteOwner);

module.exports = router;

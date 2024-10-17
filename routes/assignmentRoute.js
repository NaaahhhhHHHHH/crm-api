const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

router.post('/api/assignment', authenticateToken, authorizeRole(['owner', 'employee']), createAssignment);
router.get('/api/assignment', authenticateToken, getAllAssignments);
router.get('/api/assignment/:id', authenticateToken, getAssignmentById);
router.put('/api/assignment/:id', authenticateToken, authorizeRole(['owner', 'employee']), updateAssignment);
router.delete('/api/assignment/:id', authenticateToken, authorizeRole(['owner', 'employee']), deleteAssignment);

module.exports = router;

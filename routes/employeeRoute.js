const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

router.post('/api/employee', authenticateToken, authorizeRole(['owner']), createEmployee);
router.get('/api/employee', authenticateToken, getEmployees);
router.get('/api/employee/:id', authenticateToken, getEmployeeById);
router.put('/api/employee/:id', authenticateToken, authorizeRole(['owner', 'employee']), updateEmployee);
router.delete('/api/employee/:id', authenticateToken, authorizeRole(['owner']), deleteEmployee);

module.exports = router;

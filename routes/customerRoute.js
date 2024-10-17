const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  registerCustomer
} = require('../controllers/customerController');

router.post('/api/customer', createCustomer);
router.post('/api/customer/register', registerCustomer);
router.get('/api/customer', authenticateToken, getCustomers);
router.get('/api/customer:id', authenticateToken, getCustomerById);
router.put('/api/customer/:id', authenticateToken, updateCustomer);
router.delete('/api/customer/:id', authenticateToken, authorizeRole(['owner']), deleteCustomer);

module.exports = router;

const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {loginCustomer, loginAdmin, auth} = require('../controllers/authController');

router.post('/api/auth/loginAdmin', loginAdmin);
router.post('/api/auth/loginCustomer', loginCustomer);
router.get('/api/auth', authenticateToken, auth);

module.exports = router;

const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {login, auth} = require('../controllers/authController');

router.post('/api/auth/login', login);
router.get('/api/auth', authenticateToken, auth);

module.exports = router;

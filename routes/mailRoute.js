const express = require('express');
const { sendEmail } = require('../controllers/mailController');
const router = express.Router();

// Route to send email
router.post('/api/sendmail', sendEmail);

module.exports = router;

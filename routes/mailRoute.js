const express = require('express');
const { sendEmailConFirm, sendEmailResetPassWord } = require('../controllers/mailController');
const router = express.Router();

// Route to send email
router.post('/api/sendEmailConFirm', sendEmailConFirm);
router.post('/api/sendEmailResetPassWord', sendEmailResetPassWord);

module.exports = router;

const express = require('express');
const { sendEmailConFirm, sendEmailResetPassWord, sendEmailForgotUser } = require('../controllers/mailController');
const router = express.Router();

// Route to send email
router.post('/api/sendEmailConFirm', sendEmailConFirm);
router.post('/api/sendEmailResetPassWord', sendEmailResetPassWord);
router.post('/api/sendEmailForgotUser', sendEmailForgotUser);

module.exports = router;

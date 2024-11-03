const nodemailer = require('nodemailer');
const Customer = require('../models/customerModel');
const Employee = require('../models/employeeModel');
const Owner = require('../models/ownerModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  // service: 'gmail',
  host: 'mi3-tr103.supercp.com',//'mail.allinclicks.net',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password (or app password)
  },
});

// Function to send email
exports.sendEmailConFirm = async (req, res) => {
  // #swagger.tags = ['mail']
  const { email } = req.body; // Extract email details from request body
  let role = 'customer'
  let user = await Customer.findOne({ where: { email } });
  // if (!user) {
  //   user = await Employee.findOne({ where: { email } });
  //   role = 'employee'
  // }
  // if (!user) {
  //   user = await Owner.findOne({ where: { email } });
  //   role = 'owner'
  // }
  if (!user) {
    return res.status(500).json({ message: "Can't find user" });
  }
  let baseUrl = role == 'customer' ? 'https://crmc.allinclicks.net' : 'https://crm.allinclicks.net'
  const token = jwt.sign({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: role,
    verification: true
  },
    process.env.JWT_SECRET, {
    expiresIn: '1h'
  }
  );
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm Your Account',
    html: `
      <h1>Welcome to Our App!</h1>
      <p>Please confirm your email by clicking the link below:</p>
      <a href="${baseUrl}/#/VerifyMail?id=${token}">Confirm Your Account</a>
      <br><br>
      <p>This link will expire in 1 hour</p>
      <br><br>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email: ', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// Function to send email
exports.sendEmailResetPassWord = async (req, res) => {
  // #swagger.tags = ['mail']
  const { email } = req.body; // Extract email details from request body
  let role = 'customer'
  let user = await Customer.findOne({ where: { email } });
  if (!user) {
    user = await Employee.findOne({ where: { email } });
    role = 'employee'
  }
  if (!user) {
    user = await Owner.findOne({ where: { email } });
    role = 'owner'
  }
  if (!user) {
    return res.status(500).json({ message: "Can't find user"});
  }
  let baseUrl = role == 'customer' ? 'https://crmc.allinclicks.net' : 'https://crm.allinclicks.net'
  const token = jwt.sign({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: role,
    verification: true
  },
    process.env.JWT_SECRET, {
    expiresIn: '1h'
  }
  );
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password. You can reset your password by clicking the link below:</p>
      <a href="${baseUrl}/#/ResetPassword?id=${token}">Reset Password</a>
      <br><br>
      <p>This link will expire in 1 hour</p>
      <br><br>
      <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
    `,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email: ', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

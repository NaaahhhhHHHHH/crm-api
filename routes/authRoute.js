const express = require('express');
const {
  authenticateToken,
  authorizeRole
} = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
// const passport = require('passport');
// require('../config/passport');
const fs = require('fs');
const {
  loginCustomer,
  loginAdmin,
  auth,
  verifyEmail,
  resetPassword
} = require('../controllers/authController');
const {
  AuditLog
} = require('../models/AuditLog');
router.post('/api/auth/loginAdmin', loginAdmin);
router.post('/api/auth/loginCustomer', loginCustomer);
router.get('/api/auth', authenticateToken, auth);
router.post('/api/verifyEmail', authenticateToken, verifyEmail);
router.post('/api/resetPassword', authenticateToken, resetPassword);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //const { cid } = req.body;
    const uploadDir = path.join(__dirname, '../uploads/logo');
    fs.mkdirSync(uploadDir, {
      recursive: true
    }); // Ensure directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'logo.png');
  },
});

const upload = multer({
  storage: storage
});

router.post('/api/uploadLogo', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded'
    });
  }

  res.status(200).json({
    message: 'File uploaded and replaced successfully',
    file: req.file
  });
});

const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    //const { cid } = req.body;
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    fs.mkdirSync(uploadDir, {
      recursive: true
    }); // Ensure directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.role}_${req.user.id}.png`);
  },
});

const uploadAvatar = multer({
  storage: storageAvatar
});

router.post('/api/uploadAvatar', authenticateToken, uploadAvatar.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded'
    });
  }

  res.status(200).json({
    message: 'File uploaded and replaced successfully',
    file: req.file
  });
});

router.get('/api/downloadAvatar', authenticateToken, (req, res) => {
  const filePath = path.join(__dirname, `../uploads/avatars/${req.user.role}_${req.user.id}.png`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        message: 'File not found'
      });
    }

    // Set the content type to image/png and send the image file as a response
    res.setHeader('Content-Type', 'image/png');
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res).on('error', (err) => {
      console.error(`Error sending file: ${err.message}`);
      res.status(500).json({
        message: 'Error sending file',
        error: err.message
      });
    });
  });
});

router.get('/api/historyLog', authenticateToken, async (req, res) => {
  let auditList = await AuditLog.findAll();
  res.status(200).json(auditList);
});

router.get('/api/downloadLogo', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/logo/logo.png');

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        message: 'File not found'
      });
    }

    // Set the content type to image/png and send the image file as a response
    res.setHeader('Content-Type', 'image/png');
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res).on('error', (err) => {
      console.error(`Error sending file: ${err.message}`);
      res.status(500).json({
        message: 'Error sending file',
        error: err.message
      });
    });
  });
});


router.get('/api/downloadBackground', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/logo/background.png');

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        message: 'File not found'
      });
    }

    // Set the content type to image/png and send the image file as a response
    res.setHeader('Content-Type', 'image/png');
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res).on('error', (err) => {
      console.error(`Error sending file: ${err.message}`);
      res.status(500).json({
        message: 'Error sending file',
        error: err.message
      });
    });
  });
});


// router.get('/api/auth/google',
//   passport.authenticate('google', {
//     scope: ['profile', 'email']
//   })
// );


// router.get('/api/auth/google/callback', (req, res, next) => {
//   passport.authenticate('google', { session: false }, (err, user, info) => {
//     if (err || !user) {
//       const error = info?.message || 'OAuth login failed';
//       return res.send(`
//         <html>
//           <body>
//             <script>
//               const origin = document.referrer || '*';
//               window.opener.postMessage({ error: "${error}" }, origin);
//               window.close();
//             </script>
//           </body>
//         </html>
//       `);
//     }

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         username: user.username,
//         role: user.role,
//         verification: user.verification,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.send(`
//       <html>
//         <body>
//           <script>
//             const origin = document.referrer || '*';
//             const token = '${token}';
//             const user = ${JSON.stringify(user)};
//             window.opener.postMessage({ token, user }, origin);
//             window.close();
//           </script>
//         </body>
//       </html>
//     `);
//   })(req, res, next);
// });


module.exports = router;

const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {loginCustomer, loginAdmin, auth} = require('../controllers/authController');

router.post('/api/auth/loginAdmin', loginAdmin);
router.post('/api/auth/loginCustomer', loginCustomer);
router.get('/api/auth', authenticateToken, auth);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //const { cid } = req.body;
        const uploadDir = path.join(__dirname, '../uploads/logo');
        fs.mkdirSync(uploadDir, { recursive: true }); // Ensure directory exists
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'logo.png'); // Add timestamp to avoid overwriting files
    },
  });
  
  const upload = multer({ storage });
  

router.post('/api/uploadLogo', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    res.status(200).json({ message: 'File uploaded and replaced successfully', file: req.file });
  });
  
  router.get('/api/downloadLogo', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/logo/logo.png');
  
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).json({ message: 'File not found' });
      }
  
      // Set the content type to image/png and send the image file as a response
      res.setHeader('Content-Type', 'image/png');
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res).on('error', (err) => {
          console.error(`Error sending file: ${err.message}`);
          res.status(500).json({ message: 'Error sending file', error: err.message });
      });
    });
  });

module.exports = router;

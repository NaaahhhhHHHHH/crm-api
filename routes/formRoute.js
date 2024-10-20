const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm
} = require('../controllers/formController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      //const { cid } = req.body;
      const uploadDir = path.join(__dirname, '../uploads');
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure directory exists
      cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Add timestamp to avoid overwriting files
  },
});

const upload = multer({ storage });


router.post('/api/form', authenticateToken, createForm);
router.get('/api/form', authenticateToken, getAllForms);
router.get('/api/form/:id', authenticateToken, getFormById);
router.put('/api/form/:id', authenticateToken, updateForm);
router.delete('/api/form/:id', authenticateToken, deleteForm);
router.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});
router.get('/api/download/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ message: 'File not found' });
    }

    // Proceed with downloading the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error(`Error downloading file: ${err.message}`);
        return res.status(500).json({ message: 'Error downloading file', error: err.message });
      }
      console.log(`File downloaded successfully: ${filename}`);
    });
  });
});
router.delete('/api/delete/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file', error: err.message });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
});
module.exports = router;

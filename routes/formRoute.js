const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm
} = require('../controllers/formController');

router.post('/api/form', authenticateToken, createForm);
router.get('/api/form', authenticateToken, getAllForms);
router.get('/api/form/:id', authenticateToken, getFormById);
router.put('/api/form/:id', authenticateToken, updateForm);
router.delete('/api/form/:id', authenticateToken, deleteForm);

module.exports = router;

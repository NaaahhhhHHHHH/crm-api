const express = require('express');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');

router.post('/api/ticket', authenticateToken, createTicket);
router.get('/api/ticket', authenticateToken, getTickets);
router.get('/api/ticket/:id', authenticateToken, getTicketById);
router.put('/api/ticket/:id', authenticateToken, updateTicket);
router.delete('/api/ticket/:id', authenticateToken, deleteTicket);

module.exports = router;

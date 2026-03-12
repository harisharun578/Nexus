const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/screenshots');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// AI ticket suggestion (call ML service or fallback)
async function getAISuggestion(text) {
  try {
    const { data } = await axios.post(`${process.env.ML_SERVICE_URL}/classify-ticket`, { text }, { timeout: 3000 });
    return { category: data.category, suggestion: data.suggestion };
  } catch {
    const kw = text.toLowerCase();
    if (kw.includes('slow') || kw.includes('laptop') || kw.includes('computer'))
      return { category:'IT', suggestion:'Try: Clear temp files, check startup programs, run Windows Update' };
    if (kw.includes('vpn') || kw.includes('network') || kw.includes('internet'))
      return { category:'IT', suggestion:'Check network settings, restart router, update VPN client' };
    if (kw.includes('leave') || kw.includes('salary') || kw.includes('payslip'))
      return { category:'HR', suggestion:'Contact HR at hr@nexus.ai or use the HR Portal' };
    if (kw.includes('budget') || kw.includes('expense') || kw.includes('reimbursement'))
      return { category:'Finance', suggestion:'Submit expense claim through Finance portal with receipts' };
    return { category:'IT', suggestion:'A specialist will review your ticket within 2 business hours.' };
  }
}

// Create ticket
router.post('/', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const { category, suggestion } = await getAISuggestion(`${title} ${description}`);
    const ticket = await Ticket.create({
      title, description, priority,
      category: req.body.category || category,
      createdBy: req.userId,
      screenshot: req.file ? `/uploads/screenshots/${req.file.filename}` : '',
      aiSuggestion: suggestion,
      aiCategory: category,
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    req.io?.emit('new-ticket', { ticketId: ticket.ticketId, category: ticket.category });
    res.status(201).json({ ticket, category });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// My tickets
router.get('/my', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(tickets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All tickets
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email department')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(50).skip((page - 1) * 50);
    res.json(tickets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update ticket
router.patch('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (ticket.status === 'Resolved') ticket.resolvedAt = new Date();
    await ticket.save();
    req.io?.to(`user-${ticket.createdBy}`).emit('ticket-updated', { ticketId: ticket.ticketId, status: ticket.status });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// AI suggestion for text
router.post('/suggest', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const result = await getAISuggestion(text);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

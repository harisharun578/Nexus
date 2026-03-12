const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Apply leave
router.post('/apply-leave', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const leave = await LeaveRequest.create({
      employee: req.userId,
      type, reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    req.io?.to(`admin-room`).emit('new-leave', { userId: req.userId, type });
    res.status(201).json(leave);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// My leaves
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.userId }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All leaves (admin/hr)
router.get('/all-leaves', auth, adminOnly, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().populate('employee','name email department').sort({ createdAt:-1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Approve/Reject
router.patch('/leaves/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id,
      { status, approvedBy: req.userId, approverComment: comment },
      { new: true }
    );
    req.io?.to(`user-${leave.employee}`).emit('leave-updated', { status, type: leave.type });
    res.json(leave);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Leave balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('leaveBalance');
    res.json({ leaveBalance: user.leaveBalance });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

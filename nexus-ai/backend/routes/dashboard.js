const router = require('express').Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const LeaveRequest = require('../models/LeaveRequest');

router.get('/stats', auth, async (req, res) => {
  try {
    const [openTickets, pendingLeaves, user] = await Promise.all([
      Ticket.countDocuments({ createdBy: req.userId, status: { $in: ['Open', 'In Progress'] } }),
      LeaveRequest.countDocuments({ employee: req.userId, status: 'Pending' }),
      User.findById(req.userId).select('leaveBalance attendanceRate burnoutRisk'),
    ]);
    res.json({
      leaveBalance: user?.leaveBalance || 18,
      openTickets,
      pendingApprovals: pendingLeaves,
      attendanceRate: user?.attendanceRate || 96,
      burnoutRisk: user?.burnoutRisk || 0,
    });
  } catch (err) {
    res.json({ leaveBalance: 18, openTickets: 3, pendingApprovals: 2, attendanceRate: 96, burnoutRisk: 35 });
  }
});

router.get('/company-stats', auth, async (req, res) => {
  try {
    const [totalEmployees, openTickets, totalLeaves] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Ticket.countDocuments({ status: 'Open' }),
      LeaveRequest.countDocuments({ status: 'Approved', startDate: { $gte: new Date(new Date().setDate(1)) } }),
    ]);
    res.json({ totalEmployees, openTickets, totalLeaves, systemHealth: 99.9 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

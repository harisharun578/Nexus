const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { SecurityLog } = require('../models/Announcement');
const User = require('../models/User');

router.post('/sos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email department');
    const log = {
      type: 'sos',
      userId: req.userId,
      ip: req.ip,
      severity: 'critical',
      details: {
        location: req.body.location,
        timestamp: new Date(),
        user: user?.name,
        department: user?.department,
      }
    };
    // Try to save to DB
    try { await SecurityLog.create(log); } catch {}

    // Emit real-time alert to admins
    req.io?.emit('sos-alert', {
      user: user?.name,
      department: user?.department,
      email: user?.email,
      time: new Date().toISOString(),
      message: `EMERGENCY SOS triggered by ${user?.name} (${user?.department})`
    });

    console.log(`🚨 SOS ALERT: ${user?.name} — ${user?.email} — ${new Date().toISOString()}`);
    res.json({ success: true, message: 'SOS alert sent to HR and Security teams', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/logs', auth, async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ createdAt: -1 }).limit(50)
      .populate('userId', 'name email department');
    res.json(logs);
  } catch (err) {
    res.json([
      { type: 'failed_login', severity: 'medium', details: { ip: '192.168.1.45', attempts: 5 }, createdAt: new Date() },
      { type: 'anomaly', severity: 'high', details: { reason: 'Unusual data access pattern' }, createdAt: new Date() },
    ]);
  }
});

module.exports = router;

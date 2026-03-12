const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const { Announcement } = require('../models/Announcement');

router.get('/', auth, async (req, res) => {
  try {
    const anns = await Announcement.find({ $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] })
      .populate('author', 'name').sort({ createdAt: -1 }).limit(20);
    res.json(anns);
  } catch (err) {
    // Fallback demo data
    res.json([
      { _id: '1', title: '🎉 Q4 All-Hands Meeting — Dec 15th, 3PM', content: 'Join us for the quarterly all-hands meeting. All teams must attend.', priority: 'Important', createdAt: new Date() },
      { _id: '2', title: '🏖️ Holiday Schedule 2025 Posted', content: 'The 2025 holiday calendar is now available in the HR Portal.', priority: 'Normal', createdAt: new Date() },
      { _id: '3', title: '🚀 NEXUS AI v2.0 Launched', content: 'New biometric login, voice commands, and ML analytics are now live!', priority: 'Urgent', createdAt: new Date() },
    ]);
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, author: req.userId });
    req.io?.emit('new-announcement', ann);
    res.status(201).json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// employees.js
const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const { department, skill, search } = req.query;
    const filter = { isActive: true };
    if (department) filter.department = department;
    if (skill) filter.skills = { $regex: skill, $options: 'i' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
    const employees = await User.find(filter)
      .select('name email department role skills phone status photo burnoutRisk')
      .sort({ name: 1 });
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -faceEmbeddings -fingerprintCredential');
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const allowed = ['name', 'department', 'role', 'skills', 'phone', 'status', 'isActive'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password -faceEmbeddings -fingerprintCredential');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

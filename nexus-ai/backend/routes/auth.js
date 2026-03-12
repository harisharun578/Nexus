const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/photos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'nexus_secret', {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

// ── POST /api/auth/signup ──────────────────────────────────────────
router.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, department, role, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, password, department, phone,
      role: role === 'admin' ? 'Employee' : role, // prevent self-admin escalation
      photo: req.file ? `/uploads/photos/${req.file.filename}` : '',
    });
    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.lastLogin = new Date(); user.status = 'online';
    await user.save();
    const token = signToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/google ──────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: Math.random().toString(36) + Date.now(),
        photo: payload.picture,
        department: 'Engineering',
        role: 'Employee',
      });
    }
    user.lastLogin = new Date(); user.status = 'online';
    await user.save();
    const token = signToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed: ' + err.message });
  }
});

// ── POST /api/auth/register-face ─────────────────────────────────
router.post('/register-face', auth, async (req, res) => {
  try {
    const { descriptors } = req.body;
    if (!descriptors?.length) return res.status(400).json({ message: 'No face descriptors provided' });
    await User.findByIdAndUpdate(req.userId, {
      faceEmbeddings: descriptors,
      faceRegistered: true,
    });
    res.json({ success: true, count: descriptors.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/face-login ─────────────────────────────────────
// Uses Euclidean distance between 128-dim face descriptors
router.post('/face-login', async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor?.length) return res.status(400).json({ message: 'No descriptor provided' });

    const users = await User.find({ faceRegistered: true }).select('+faceEmbeddings');
    let bestMatch = null;
    let bestDist = Infinity;
    const THRESHOLD = 0.5;

    for (const user of users) {
      if (!user.faceEmbeddings?.length) continue;
      for (const stored of user.faceEmbeddings) {
        // Euclidean distance
        const dist = Math.sqrt(
          stored.reduce((sum, val, i) => sum + (val - descriptor[i]) ** 2, 0)
        );
        if (dist < bestDist) { bestDist = dist; bestMatch = user; }
      }
    }

    if (bestMatch && bestDist < THRESHOLD) {
      bestMatch.lastLogin = new Date(); bestMatch.status = 'online';
      await bestMatch.save();
      const token = signToken(bestMatch._id);
      return res.json({ success: true, token, user: bestMatch.toPublic(), distance: bestDist });
    }

    res.json({ success: false, distance: bestDist, message: 'Face not recognized' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/register-fingerprint ─────────────────────────
router.post('/register-fingerprint', auth, async (req, res) => {
  try {
    const { credential } = req.body;
    await User.findByIdAndUpdate(req.userId, {
      fingerprintCredential: credential,
      fingerprintRegistered: true,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/fingerprint-login ─────────────────────────────
router.post('/fingerprint-login', async (req, res) => {
  try {
    const { credential } = req.body;
    const user = await User.findOne({ 'fingerprintCredential.id': credential.id });
    if (!user) return res.json({ success: false, message: 'Fingerprint not recognized' });
    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: String, default: 'All' },
  priority: { type: String, enum: ['Normal','Important','Urgent'], default: 'Normal' },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const securityLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['login','logout','failed_login','face_auth','fingerprint_auth','anomaly','sos','access'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: String,
  userAgent: String,
  details: Object,
  severity: { type: String, enum: ['low','medium','high','critical'], default: 'low' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Announcement: mongoose.model('Announcement', announcementSchema),
  SecurityLog: mongoose.model('SecurityLog', securityLogSchema),
};

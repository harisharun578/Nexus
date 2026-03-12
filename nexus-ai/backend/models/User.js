const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  department: { type: String, default: 'Engineering' },
  role: { type: String, enum: ['Employee','Manager','Team Lead','Director','Intern','admin','hr'], default: 'Employee' },
  phone: { type: String, default: '' },
  photo: { type: String, default: '' },
  skills: [String],
  status: { type: String, enum: ['online','away','offline','busy'], default: 'offline' },

  // Biometric
  faceEmbeddings: [[Number]],      // array of 128-dim face descriptors
  faceRegistered: { type: Boolean, default: false },
  fingerprintCredential: { type: Object, default: null },
  fingerprintRegistered: { type: Boolean, default: false },

  // Work data
  workHoursThisWeek: { type: Number, default: 0 },
  leaveBalance: { type: Number, default: 18 },
  attendanceRate: { type: Number, default: 96 },
  burnoutRisk: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.faceEmbeddings;
  delete obj.fingerprintCredential;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Annual Leave','Sick Leave','Casual Leave','Maternity Leave','Paternity Leave','Emergency Leave'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverComment: String,
  days: Number,
  createdAt: { type: Date, default: Date.now },
});

leaveSchema.pre('save', function(next) {
  const ms = this.endDate - this.startDate;
  this.days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveSchema);

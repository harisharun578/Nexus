const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['IT','HR','Finance','Operations','Security','General'], default: 'IT' },
  priority: { type: String, enum: ['Low','Medium','High','Critical'], default: 'Medium' },
  status: { type: String, enum: ['Open','In Progress','Pending','Resolved','Closed'], default: 'Open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  screenshot: { type: String },
  aiSuggestion: { type: String },
  aiCategory: { type: String },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  resolvedAt: Date,
  slaDeadline: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ticketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    this.ticketId = 'TK-' + Date.now().toString().slice(-6);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);

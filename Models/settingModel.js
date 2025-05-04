// models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // emergencyContact: String,
  alertMode: String,
  // safeZone: Number,
  liveLocation: { type: Boolean, default: false },
  // notifyAlerts: { type: Boolean, default: true }
});

module.exports = mongoose.model('Setting', settingSchema);

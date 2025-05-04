const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  contactNumber: {
    type: String,
    required: true
  },
  emergencyContactEmail: {
    type: String,
  },
  contactName: {
    type: String,
    required: true
  },
  relation: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);

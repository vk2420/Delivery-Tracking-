const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  truckNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  empNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  location: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);


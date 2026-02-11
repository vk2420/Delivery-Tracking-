const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    default: 'pcs'
  }
});

const deliverySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  invoiceNo: {
    type: String,
    required: true,
    trim: true
  },
  items: [itemSchema],
  status: {
    type: String,
    enum: ['Out for Delivery', 'Delivered', 'Failed', 'Not Delivered', 'Postponed', 'Replacement Scheduled', 'On Hold', 'Cancelled', 'RTS'],
    default: 'Out for Delivery'
  },
  failureReason: {
    type: String,
    trim: true
  },
  failureReasonArabic: {
    type: String,
    trim: true
  },
  postponedDate: {
    type: Date
  },
  replacementDetails: {
    pickupDate: Date,
    deliveryDate: Date,
    itemDescription: String,
    reason: String
  },
  statusHistory: [{
    status: String,
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: String
  }],
  crmNo: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  tripSheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripSheet'
  },
  shift: {
    type: String,
    enum: ['Morning', 'Afternoon'],
    default: 'Afternoon'
  },
  // New fields for enhanced tracking
  deliverySource: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  cluster: {
    type: String,
    trim: true
  },
  concept: {
    type: String,
    enum: ['Homebox', 'Homecenter', 'Unknown'],
    trim: true,
    default: 'Unknown'
  },
  remarks: [{
    remark: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: String,
      required: true,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    remarkType: {
      type: String,
      enum: ['General', 'Postponed', 'Failed', 'RTS', 'Replacement'],
      default: 'General'
    }
  }],
  rtsStatus: {
    type: String,
    enum: ['Not Applicable', 'Returned to Store', 'Warehouse Received'],
    default: 'Not Applicable'
  },
  rtsReason: {
    type: String,
    trim: true
  },
  rtsDate: {
    type: Date
  },
  driverName: {
    type: String,
    trim: true
  },
  driverPhone: {
    type: String,
    trim: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  routeSequence: {
    type: Number,
    default: 0
  },
  estimatedArrival: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);


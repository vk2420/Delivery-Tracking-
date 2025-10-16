const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
// No WhatsApp functionality - removed all WhatsApp imports

/**
 * Update delivery status and send automatic WhatsApp notification
 * POST /api/deliveries/:id/status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failureReason, failureReasonArabic, postponedDate, replacementDetails, onHoldReason, updatedBy } = req.body;

    // Find delivery and populate customer and driver
    const delivery = await Delivery.findById(id)
      .populate('customerId')
      .populate('driverId');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    const oldStatus = delivery.status;

    // Update delivery based on status
    delivery.status = status;

    // Add to status history
    delivery.statusHistory = delivery.statusHistory || [];
    delivery.statusHistory.push({
      status,
      reason: failureReason || onHoldReason || 'Status updated',
      timestamp: new Date(),
      updatedBy: updatedBy || 'System'
    });

    // Handle different status updates
    switch (status) {
      case 'Not Delivered':
        delivery.failureReason = failureReason || 'Delivery attempt unsuccessful';
        delivery.failureReasonArabic = failureReasonArabic || 'محاولة التوصيل غير ناجحة';
        break;

      case 'Postponed':
        if (!postponedDate) {
          return res.status(400).json({
            success: false,
            message: 'Postponed date is required for postponed status'
          });
        }
        delivery.postponedDate = postponedDate;
        delivery.failureReason = failureReason;
        break;

      case 'Replacement Scheduled':
        if (!replacementDetails) {
          return res.status(400).json({
            success: false,
            message: 'Replacement details are required'
          });
        }
        delivery.replacementDetails = replacementDetails;
        break;

      case 'Delivered':
        delivery.deliveredAt = new Date();
        break;

      case 'On Hold':
        delivery.failureReason = onHoldReason || 'On hold as per request';
        break;

      case 'Cancelled':
        // Cancelled status
        break;

      default:
        break;
    }

    // Save delivery
    await delivery.save();

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: {
        delivery: {
          id: delivery._id,
          invoiceNo: delivery.invoiceNo,
          status: delivery.status,
          oldStatus,
          customerName: delivery.customerId.name,
          customerPhone: delivery.customerId.phone1,
          driverName: delivery.driverId.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
});

/**
 * Get all deliveries with filters
 * GET /api/deliveries?status=Out for Delivery&driverId=xxx&cluster=Jeddah&concept=Homebox
 */
router.get('/', async (req, res) => {
  try {
    const { status, driverId, date, cluster, concept } = req.query;
    
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (driverId) {
      filter.driverId = driverId;
    }
    
    if (cluster) {
      filter.cluster = cluster;
    }
    
    if (concept) {
      filter.concept = concept;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const deliveries = await Delivery.find(filter)
      .populate('customerId')
      .populate('driverId')
      .populate('tripSheetId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });

  } catch (error) {
    console.error('❌ Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message
    });
  }
});

/**
 * Get cluster options
 * GET /api/deliveries/cluster-options
 */
router.get('/cluster-options', async (req, res) => {
  try {
    const { getClusterOptions } = require('../utils/deliverySourceMapping');
    const options = getClusterOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('❌ Error fetching cluster options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cluster options',
      error: error.message
    });
  }
});

/**
 * Get concept options
 * GET /api/deliveries/concept-options
 */
router.get('/concept-options', async (req, res) => {
  try {
    const { getConceptOptions } = require('../utils/deliverySourceMapping');
    const options = getConceptOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('❌ Error fetching concept options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch concept options',
      error: error.message
    });
  }
});

/**
 * Get single delivery by ID
 * GET /api/deliveries/:id
 */
router.get('/:id', async (req, res) => {
  try {
    // Handle special routes first
    if (req.params.id === 'cluster-options' || req.params.id === 'concept-options') {
      return res.status(404).json({
        success: false,
        message: 'Use the specific endpoints: /api/deliveries/cluster-options or /api/deliveries/concept-options'
      });
    }

    const delivery = await Delivery.findById(req.params.id)
      .populate('customerId')
      .populate('driverId')
      .populate('tripSheetId');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    res.json({
      success: true,
      data: delivery
    });

  } catch (error) {
    console.error('❌ Error fetching delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery',
      error: error.message
    });
  }
});

/**
 * Get delivery statistics
 * GET /api/deliveries/stats/summary
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      outForDelivery: 0,
      delivered: 0,
      notDelivered: 0,
      postponed: 0,
      replacementScheduled: 0,
      onHold: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      switch (stat._id) {
        case 'Out for Delivery':
          summary.outForDelivery = stat.count;
          break;
        case 'Delivered':
          summary.delivered = stat.count;
          break;
        case 'Not Delivered':
          summary.notDelivered = stat.count;
          break;
        case 'Postponed':
          summary.postponed = stat.count;
          break;
        case 'Replacement Scheduled':
          summary.replacementScheduled = stat.count;
          break;
        case 'On Hold':
          summary.onHold = stat.count;
          break;
        case 'Cancelled':
          summary.cancelled = stat.count;
          break;
      }
    });

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error fetching delivery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery statistics',
      error: error.message
    });
  }
});

/**
 * Bulk update delivery status (for multiple deliveries)
 * POST /api/deliveries/bulk-update
 */
router.post('/bulk-update', async (req, res) => {
  try {
    const { deliveryIds, status, reason, reasonArabic } = req.body;

    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery IDs array is required'
      });
    }

    const updates = {
      status,
      $push: {
        statusHistory: {
          status,
          reason: reason || 'Bulk update',
          timestamp: new Date(),
          updatedBy: 'Admin'
        }
      }
    };

    if (status === 'Not Delivered') {
      updates.failureReason = reason;
      updates.failureReasonArabic = reasonArabic;
    }

    const result = await Delivery.updateMany(
      { _id: { $in: deliveryIds } },
      updates
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} deliveries`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('❌ Error bulk updating deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update deliveries',
      error: error.message
    });
  }
});

/**
 * Add remark to delivery
 * POST /api/deliveries/:id/remarks
 */
router.post('/:id/remarks', async (req, res) => {
  try {
    const { id } = req.params;
    const { remark, remarkType, addedBy } = req.body;

    if (!remark || !remarkType || !addedBy) {
      return res.status(400).json({
        success: false,
        message: 'Remark, remarkType, and addedBy are required'
      });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    const newRemark = {
      remark,
      remarkType,
      addedBy,
      addedAt: new Date()
    };

    delivery.remarks = delivery.remarks || [];
    delivery.remarks.push(newRemark);
    await delivery.save();

    res.json({
      success: true,
      message: 'Remark added successfully',
      data: delivery
    });

  } catch (error) {
    console.error('❌ Error adding remark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add remark',
      error: error.message
    });
  }
});

/**
 * Update RTS status
 * PATCH /api/deliveries/:id/rts
 */
router.patch('/:id/rts', async (req, res) => {
  try {
    const { id } = req.params;
    const { rtsStatus, rtsReason, rtsDate } = req.body;

    if (!rtsStatus) {
      return res.status(400).json({
        success: false,
        message: 'RTS status is required'
      });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    delivery.rtsStatus = rtsStatus;
    if (rtsReason) delivery.rtsReason = rtsReason;
    if (rtsDate) delivery.rtsDate = new Date(rtsDate);

    await delivery.save();

    res.json({
      success: true,
      message: 'RTS status updated successfully',
      data: delivery
    });

  } catch (error) {
    console.error('❌ Error updating RTS status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update RTS status',
      error: error.message
    });
  }
});

module.exports = router;





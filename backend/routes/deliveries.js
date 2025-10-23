const express = require('express');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const { generateCRMNumber } = require('../utils/crm');
const { generateDeliveryMessage } = require('../utils/whatsapp');

const router = express.Router();

// Get all deliveries with filters
router.get('/', async (req, res) => {
  try {
    const { status, driverId, date, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (driverId) filter.driverId = driverId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const deliveries = await Delivery.find(filter)
      .populate('customerId', 'name phone1 phone2 address')
      .populate('driverId', 'name phone truckNo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(filter);

    res.json({
      success: true,
      data: deliveries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries', details: error.message });
  }
});

// Get delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('customerId', 'name phone1 phone2 address')
      .populate('driverId', 'name phone truckNo');

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery', details: error.message });
  }
});

// Update delivery status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Out for Delivery', 'Delivered', 'Not Delivered', 'Damage Case'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const delivery = await Delivery.findById(req.params.id)
      .populate('customerId', 'name phone1 phone2 address')
      .populate('driverId', 'name phone truckNo');

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const oldStatus = delivery.status;
    delivery.status = status;

    // Handle specific status updates
    if (status === 'Delivered') {
      delivery.deliveredAt = new Date();
      delivery.reason = null;
      delivery.crmNo = null;
    } else if (status === 'Not Delivered') {
      if (!reason) {
        return res.status(400).json({ error: 'Reason is required for not delivered status' });
      }
      delivery.reason = reason;
      delivery.crmNo = null;
    } else if (status === 'Damage Case') {
      delivery.crmNo = generateCRMNumber();
      delivery.reason = reason || 'Damage reported';
    }

    await delivery.save();

    // Send WhatsApp notification based on status change
    if (oldStatus !== status && delivery.customerId.phone1) {
      let message = '';
      
      if (status === 'Out for Delivery') {
        message = generateDeliveryMessage(
          delivery.driverId.name, 
          delivery.driverId.phone, 
          delivery.invoiceNo,
          delivery.shift || 'Afternoon'
        );
      } else if (status === 'Not Delivered') {
        message = generateNotDeliveredMessage(reason);
      } else if (status === 'Damage Case') {
        message = generateDamageCaseMessage(delivery.crmNo);
      }

      if (message) {
        // Format phone number for Saudi Arabia
        const phoneNumber = delivery.customerId.phone1.startsWith('+966') 
          ? delivery.customerId.phone1 
          : `+966${delivery.customerId.phone1}`;
        
        const result = await sendWhatsAppMessage(phoneNumber, message);
        console.log(`📱 Notification sent to ${delivery.customerId.name}: ${result.success ? 'Success' : 'Failed'}`);
      }
    }

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: delivery
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Failed to update delivery status', details: error.message });
  }
});

// Get delivery statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { date } = req.query;
    
    const filter = {};
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const stats = await Delivery.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      delivered: 0,
      pending: 0,
      failed: 0,
      damage: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      switch (stat._id) {
        case 'Delivered':
          summary.delivered = stat.count;
          break;
        case 'Out for Delivery':
          summary.pending = stat.count;
          break;
        case 'Not Delivered':
          summary.failed = stat.count;
          break;
        case 'Damage Case':
          summary.damage = stat.count;
          break;
      }
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery statistics', details: error.message });
  }
});

// Bulk update delivery statuses
router.patch('/bulk/status', async (req, res) => {
  try {
    const { deliveryIds, status, reason } = req.body;
    
    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      return res.status(400).json({ error: 'Delivery IDs array is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Out for Delivery', 'Delivered', 'Not Delivered', 'Damage Case'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    
    if (status === 'Delivered') {
      updateData.deliveredAt = new Date();
      updateData.reason = null;
      updateData.crmNo = null;
    } else if (status === 'Not Delivered') {
      if (!reason) {
        return res.status(400).json({ error: 'Reason is required for not delivered status' });
      }
      updateData.reason = reason;
      updateData.crmNo = null;
    } else if (status === 'Damage Case') {
      updateData.crmNo = generateCRMNumber();
      updateData.reason = reason || 'Damage reported';
    }

    const result = await Delivery.updateMany(
      { _id: { $in: deliveryIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} deliveries`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update delivery status error:', error);
    res.status(500).json({ error: 'Failed to bulk update delivery statuses', details: error.message });
  }
});

module.exports = router;


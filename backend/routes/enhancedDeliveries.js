const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const { getClusterAndConcept, filterDeliveries, getDeliveryStatistics } = require('../utils/deliverySourceMapping');

// Get all deliveries with filtering
router.get('/', async (req, res) => {
  try {
    const { cluster, concept, status, search } = req.query;
    
    let query = {};
    
    // Apply filters
    if (cluster) query.cluster = cluster;
    if (concept) query.concept = concept;
    if (status) query.status = status;
    
    // Search functionality
    if (search) {
      query.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const deliveries = await Delivery.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Get delivery statistics
router.get('/stats', async (req, res) => {
  try {
    const deliveries = await Delivery.find({}).lean();
    const stats = getDeliveryStatistics(deliveries);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching delivery statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single delivery
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({ error: 'Failed to fetch delivery' });
  }
});

// Update delivery status
router.put('/:id', async (req, res) => {
  try {
    const { status, failureReason, postponedDate, postponedReason, rtsStatus, rtsReason, rtsDate } = req.body;
    
    const updateData = { status };
    
    // Add status-specific fields
    if (status === 'Failed' && failureReason) {
      updateData.failureReason = failureReason;
    }
    
    if (status === 'Postponed') {
      if (postponedDate) updateData.postponedDate = new Date(postponedDate);
      if (postponedReason) updateData.postponedReason = postponedReason;
    }
    
    if (rtsStatus) updateData.rtsStatus = rtsStatus;
    if (rtsReason) updateData.rtsReason = rtsReason;
    if (rtsDate) updateData.rtsDate = new Date(rtsDate);
    
    // Add to status history
    updateData.$push = {
      statusHistory: {
        status: status,
        reason: failureReason || postponedReason || rtsReason || 'Status updated',
        timestamp: new Date(),
        updatedBy: req.body.updatedBy || 'System'
      }
    };
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({ error: 'Failed to update delivery' });
  }
});

// Add remark to delivery
router.post('/:id/remarks', async (req, res) => {
  try {
    const { remark, addedBy, remarkType } = req.body;
    
    if (!remark || !addedBy) {
      return res.status(400).json({ error: 'Remark and addedBy are required' });
    }
    
    const newRemark = {
      remark,
      addedBy,
      remarkType: remarkType || 'General',
      addedAt: new Date()
    };
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { $push: { remarks: newRemark } },
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Error adding remark:', error);
    res.status(500).json({ error: 'Failed to add remark' });
  }
});

// Get deliveries by cluster
router.get('/cluster/:cluster', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ cluster: req.params.cluster })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries by cluster:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries by cluster' });
  }
});

// Get deliveries by concept
router.get('/concept/:concept', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ concept: req.params.concept })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries by concept:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries by concept' });
  }
});

// Get deliveries by delivery source
router.get('/source/:source', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliverySource: req.params.source })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries by source:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries by source' });
  }
});

// Bulk update deliveries
router.put('/bulk/update', async (req, res) => {
  try {
    const { deliveryIds, updateData } = req.body;
    
    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      return res.status(400).json({ error: 'deliveryIds array is required' });
    }
    
    const result = await Delivery.updateMany(
      { _id: { $in: deliveryIds } },
      { $set: updateData }
    );
    
    res.json({ 
      message: `Updated ${result.modifiedCount} deliveries`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating deliveries:', error);
    res.status(500).json({ error: 'Failed to bulk update deliveries' });
  }
});

// Get delivery analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const { startDate, endDate, cluster, concept } = req.query;
    
    let matchQuery = {};
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    if (cluster) matchQuery.cluster = cluster;
    if (concept) matchQuery.concept = concept;
    
    const analytics = await Delivery.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              cluster: '$cluster',
              concept: '$concept'
            }
          },
          byCluster: {
            $push: {
              cluster: '$cluster',
              concept: '$concept'
            }
          },
          byConcept: {
            $push: {
              concept: '$concept'
            }
          }
        }
      }
    ]);
    
    res.json(analytics[0] || { totalDeliveries: 0, byStatus: [], byCluster: [], byConcept: [] });
  } catch (error) {
    console.error('Error fetching delivery analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

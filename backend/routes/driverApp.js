const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');

/**
 * Driver Login by DO Number
 * POST /api/driver/login
 */
router.post('/login', async (req, res) => {
  try {
    const { doNumber, phone } = req.body;
    
    // Find driver by employee number
    const driver = await Driver.findOne({ 
      empNo: doNumber
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'No driver found for this employee number'
      });
    }
    
    // Verify phone number (optional security check)
    if (phone && driver.phone !== phone) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    res.json({
      success: true,
      driver: {
        id: driver._id,
        name: driver.name,
        empNo: driver.empNo,
        phone: driver.phone,
        doNumber: doNumber
      }
    });
  } catch (error) {
    console.error('❌ Driver login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * Get driver's deliveries
 * GET /api/driver/deliveries/:driverId
 */
router.get('/deliveries/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query;
    
    let filter = { driverId };
    if (status) {
      filter.status = status;
    }
    
    const deliveries = await Delivery.find(filter)
      .populate('customerId', 'name phone1 phone2 address')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      deliveries: deliveries.map(delivery => ({
        id: delivery._id,
        invoiceNo: delivery.invoiceNo,
        customerName: delivery.customerId?.name || delivery.customerName,
        customerPhone: delivery.customerId?.phone1 || delivery.customerPhone,
        address: delivery.customerId?.address || delivery.address,
        status: delivery.status,
        shift: delivery.shift,
        items: delivery.items,
        createdAt: delivery.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message
    });
  }
});

/**
 * Update delivery status
 * PATCH /api/driver/deliveries/:deliveryId/status
 */
router.patch('/deliveries/:deliveryId/status', async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, reason, location, photo } = req.body;
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (reason) {
      updateData.failureReason = reason;
    }
    
    if (location) {
      updateData.deliveryLocation = location;
    }
    
    if (photo) {
      updateData.deliveryPhoto = photo;
    }
    
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      updateData,
      { new: true }
    ).populate('customerId', 'name phone1 phone2 address');
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      delivery: {
        id: delivery._id,
        invoiceNo: delivery.invoiceNo,
        status: delivery.status,
        customerName: delivery.customerId?.name || delivery.customerName
      }
    });
  } catch (error) {
    console.error('❌ Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
});

/**
 * Get delivery details
 * GET /api/driver/deliveries/:deliveryId/details
 */
router.get('/deliveries/:deliveryId/details', async (req, res) => {
  try {
    const { deliveryId } = req.params;
    
    const delivery = await Delivery.findById(deliveryId)
      .populate('customerId', 'name phone1 phone2 address')
      .populate('driverId', 'name phone empNo');
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      delivery: {
        id: delivery._id,
        invoiceNo: delivery.invoiceNo,
        customerName: delivery.customerId?.name || delivery.customerName,
        customerPhone: delivery.customerId?.phone1 || delivery.customerPhone,
        customerPhone2: delivery.customerId?.phone2 || delivery.phone2,
        address: delivery.customerId?.address || delivery.address,
        status: delivery.status,
        shift: delivery.shift,
        items: delivery.items,
        driverName: delivery.driverId?.name || delivery.driverName,
        driverPhone: delivery.driverId?.phone || delivery.driverPhone,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get delivery details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery details',
      error: error.message
    });
  }
});

module.exports = router;


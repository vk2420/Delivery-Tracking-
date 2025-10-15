const express = require('express');
const Driver = require('../models/Driver');

const router = express.Router();

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find({ isActive: true })
      .sort({ name: 1 });

    res.json({ success: true, data: drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Failed to fetch drivers', details: error.message });
  }
});

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Failed to fetch driver', details: error.message });
  }
});

// Create new driver
router.post('/', async (req, res) => {
  try {
    const { name, phone, truckNo, empNo } = req.body;

    if (!name || !phone || !truckNo || !empNo) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if driver with same truck number or employee number already exists
    const existingDriver = await Driver.findOne({
      $or: [{ truckNo }, { empNo }]
    });

    if (existingDriver) {
      return res.status(400).json({ 
        error: 'Driver with this truck number or employee number already exists' 
      });
    }

    const driver = new Driver({
      name,
      phone,
      truckNo,
      empNo
    });

    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Failed to create driver', details: error.message });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, truckNo, empNo, isActive } = req.body;

    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check if truck number or employee number is being changed to an existing one
    if (truckNo && truckNo !== driver.truckNo) {
      const existingDriver = await Driver.findOne({ truckNo, _id: { $ne: driver._id } });
      if (existingDriver) {
        return res.status(400).json({ error: 'Truck number already exists' });
      }
    }

    if (empNo && empNo !== driver.empNo) {
      const existingDriver = await Driver.findOne({ empNo, _id: { $ne: driver._id } });
      if (existingDriver) {
        return res.status(400).json({ error: 'Employee number already exists' });
      }
    }

    // Update fields
    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (truckNo) driver.truckNo = truckNo;
    if (empNo) driver.empNo = empNo;
    if (typeof isActive === 'boolean') driver.isActive = isActive;

    await driver.save();

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Failed to update driver', details: error.message });
  }
});

// Delete driver (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.isActive = false;
    await driver.save();

    res.json({
      success: true,
      message: 'Driver deactivated successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Failed to delete driver', details: error.message });
  }
});

module.exports = router;


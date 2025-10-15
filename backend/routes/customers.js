const express = require('express');
const Customer = require('../models/Customer');

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone1: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      data: customers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone1, phone2, address, city, pincode } = req.body;

    if (!name || !phone1 || !address) {
      return res.status(400).json({ error: 'Name, phone1, and address are required' });
    }

    // Check if customer with same phone number already exists
    const existingCustomer = await Customer.findOne({ phone1 });

    if (existingCustomer) {
      return res.status(400).json({ 
        error: 'Customer with this phone number already exists' 
      });
    }

    const customer = new Customer({
      name,
      phone1,
      phone2: phone2 || '',
      address,
      city: city || '',
      pincode: pincode || ''
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer', details: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone1, phone2, address, city, pincode } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if phone number is being changed to an existing one
    if (phone1 && phone1 !== customer.phone1) {
      const existingCustomer = await Customer.findOne({ phone1, _id: { $ne: customer._id } });
      if (existingCustomer) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }
    }

    // Update fields
    if (name) customer.name = name;
    if (phone1) customer.phone1 = phone1;
    if (phone2 !== undefined) customer.phone2 = phone2;
    if (address) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (pincode !== undefined) customer.pincode = pincode;

    await customer.save();

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer', details: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer', details: error.message });
  }
});

module.exports = router;


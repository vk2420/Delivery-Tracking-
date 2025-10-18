const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();

// One-time setup endpoint to initialize admin accounts
// This should be called once after deployment
router.post('/init-admins', async (req, res) => {
  try {
    const admins = [
      { username: 'admin_jeddah', password: 'jeddah123', region: 'Jeddah' },
      { username: 'admin_yanbu', password: 'yanbu123', region: 'Yanbu' },
      { username: 'admin_albaha', password: 'albaha123', region: 'Albaha' },
      { username: 'admin_taif', password: 'taif123', region: 'Taif' },
      { username: 'admin_madina', password: 'madina123', region: 'Madina' }
    ];

    const results = [];

    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ username: adminData.username });
      
      if (existingAdmin) {
        results.push({
          username: adminData.username,
          status: 'already_exists'
        });
      } else {
        const admin = new Admin(adminData);
        await admin.save();
        results.push({
          username: adminData.username,
          region: adminData.region,
          status: 'created'
        });
      }
    }

    res.json({
      success: true,
      message: 'Admin initialization complete',
      results
    });

  } catch (error) {
    console.error('❌ Init admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize admins',
      error: error.message
    });
  }
});

// Check admin status
router.get('/check-admins', async (req, res) => {
  try {
    const admins = await Admin.find({}).select('username region role isActive');
    
    res.json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error('❌ Check admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check admins',
      error: error.message
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const config = require('../config');
require('dotenv').config();

const admins = [
  { username: 'admin_jeddah', password: 'jeddah123', region: 'Jeddah' },
  { username: 'admin_yanbu', password: 'yanbu123', region: 'Yanbu' },
  { username: 'admin_albaha', password: 'albaha123', region: 'Albaha' },
  { username: 'admin_taif', password: 'taif123', region: 'Taif' },
  { username: 'admin_madina', password: 'madina123', region: 'Madina' }
];

async function initAdmins() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ username: adminData.username });
      
      if (existingAdmin) {
        console.log(`👤 Admin ${adminData.username} already exists`);
      } else {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`✅ Created admin: ${adminData.username} (${adminData.region})`);
      }
    }

    console.log('🎉 Admin initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initAdmins();

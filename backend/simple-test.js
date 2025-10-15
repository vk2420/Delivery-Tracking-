console.log('Testing basic Node.js functionality...');

try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded');
  
  const config = require('./config');
  console.log('✅ Config loaded:', config);
  
  console.log('✅ All basic dependencies working');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

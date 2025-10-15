const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');
// No WhatsApp functionality - system runs without messaging

// Import routes
const uploadRoutes = require('./routes/upload');
const deliveryRoutes = require('./routes/deliveries');
const deliveryStatusRoutes = require('./routes/deliveryStatus');
const enhancedDeliveryRoutes = require('./routes/enhancedDeliveries'); // Enhanced delivery routes
const driverRoutes = require('./routes/drivers');
const customerRoutes = require('./routes/customers');
const driverAppRoutes = require('./routes/driverApp'); // Driver mobile app routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin interface
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/deliveries', deliveryStatusRoutes); // Enhanced delivery routes with status updates
app.use('/api/enhanced-deliveries', enhancedDeliveryRoutes); // New enhanced delivery routes
app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/driver', driverAppRoutes); // Driver mobile app routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Delivery Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
  // No WhatsApp functionality - system runs without messaging
  console.log('🚫 No WhatsApp functionality - system runs without messaging');
    
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📊 Health check: http://localhost:${config.PORT}/api/health`);
      console.log(`📁 Upload endpoint: http://localhost:${config.PORT}/api/upload/upload`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await whatsappWebService.destroy();
    console.log('✅ WhatsApp Web disconnected');
  } catch (error) {
    console.error('⚠️ Error disconnecting WhatsApp Web:', error.message);
  }
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await whatsappWebService.destroy();
    console.log('✅ WhatsApp Web disconnected');
  } catch (error) {
    console.error('⚠️ Error disconnecting WhatsApp Web:', error.message);
  }
  await mongoose.connection.close();
  process.exit(0);
});

startServer();


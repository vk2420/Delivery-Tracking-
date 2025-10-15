module.exports = {
  PORT: process.env.PORT || 3001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery_portal',
  NODE_ENV: process.env.NODE_ENV || 'development'
};


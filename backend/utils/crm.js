const { v4: uuidv4 } = require('uuid');

// Generate unique CRM number
const generateCRMNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CRM${timestamp}${random}`;
};

// Generate unique delivery ID
const generateDeliveryId = () => {
  return `DEL${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
};

module.exports = {
  generateCRMNumber,
  generateDeliveryId
};


// WhatsApp utility - FROZEN VERSION (No actual message sending)
// No WhatsApp dependencies - system runs without messaging

const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    console.log(`📱 [FROZEN] WhatsApp message would be sent to ${phoneNumber}`);
    console.log(`📝 [FROZEN] Message: ${message}`);
    
    // WHATSAPP MESSAGES ARE FROZEN - NO ACTUAL SENDING
    console.log('🚫 WhatsApp messages are FROZEN - no actual sending');
    
    return {
      success: true,
      messageId: `frozen_${Date.now()}`,
      timestamp: new Date(),
      frozen: true
    };
  } catch (error) {
    console.error('❌ Error in frozen WhatsApp message:', error);
    throw error;
  }
};

const generateDeliveryMessage = (driverName, driverPhone, invoiceNo, shift = 'Afternoon', itemCount = 1) => {
  console.log(`🕐 DEBUG: Generating message for invoice ${invoiceNo}, Shift: "${shift}"`);
  // Determine delivery time window based on shift
  let timeWindow = '';
  let timeWindowArabic = '';

  if (shift.toLowerCase() === 'morning') {
    timeWindow = '10:00 AM to 3:00 PM';
    timeWindowArabic = '10:00 صباحاً إلى 3:00 مساءً';
    console.log(`🌅 DEBUG: Using MORNING time window: ${timeWindow}`);
  } else {
    timeWindow = '3:00 PM to 8:00 PM';
    timeWindowArabic = '3:00 مساءً إلى 8:00 مساءً';
    console.log(`🌆 DEBUG: Using AFTERNOON time window: ${timeWindow}`);
  }

  const itemText = itemCount > 1 ? ` (${itemCount} items)` : '';
  const itemTextArabic = itemCount > 1 ? ` (${itemCount} قطع)` : '';

  return `🚚 *Your HomeCenter order is out for delivery!*
📦 *طلب هوم سنتر في الطريق للتوصيل!*

Invoice No: ${invoiceNo}${itemText}
رقم الفاتورة: ${invoiceNo}${itemTextArabic}

Driver: ${driverName}
Phone: ${driverPhone}
السائق: ${driverName}
الهاتف: ${driverPhone}

⏰ Delivery Time: ${timeWindow}
⏰ وقت التوصيل: ${timeWindowArabic}

📍 Please send your location
📍 يرجى إرسال موقعك`;
};

module.exports = {
  sendWhatsAppMessage,
  generateDeliveryMessage
};

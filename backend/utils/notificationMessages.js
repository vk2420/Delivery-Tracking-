/**
 * WhatsApp Notification Message Templates
 * Supports multiple delivery status updates
 */

const CUSTOMER_CARE_PHONE = '920012345'; // Update with your actual customer care number

/**
 * Generate time window based on shift
 */
const getTimeWindow = (shift) => {
  if (shift && shift.toLowerCase() === 'morning') {
    return {
      english: '10:00 AM to 3:00 PM',
      arabic: '10:00 صباحاً إلى 3:00 مساءً'
    };
  }
  return {
    english: '3:00 PM to 8:00 PM',
    arabic: '3:00 مساءً إلى 8:00 مساءً'
  };
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * 1. Out for Delivery Message (Initial)
 */
const generateOutForDeliveryMessage = (driverName, driverPhone, invoiceNo, shift = 'Afternoon') => {
  const timeWindow = getTimeWindow(shift);
  
  return `🚚 *WWD Furniture Delivery* | إشعار التوصيل

Dear Customer,
Your furniture order (Invoice #${invoiceNo}) is *out for delivery TODAY*!

📅 Expected Delivery: ${timeWindow.english}
👤 Your Driver: ${driverName}
📱 Call Driver Directly: ${driverPhone}

💡 Please ensure someone is available at the delivery address.

━━━━━━━━━━━━━━━━

عزيزي العميل،
طلبك من الأثاث (فاتورة رقم ${invoiceNo}) *في طريقه للتوصيل اليوم*!

📅 التوصيل المتوقع: ${timeWindow.arabic}
👤 سائقك: ${driverName}
📱 اتصل بالسائق مباشرة: ${driverPhone}

💡 يرجى التأكد من وجود شخص في عنوان التوصيل.

Thank you! | شكراً لك
*WWD Furniture*`;
};

/**
 * 2. Failed Delivery Message
 */
const generateFailedDeliveryMessage = (invoiceNo, reason, reasonArabic, originalDate) => {
  const dateStr = formatDate(originalDate);
  
  return `🚫 *Delivery Attempt Failed* | محاولة التوصيل فشلت

Dear Customer,
We attempted to deliver your furniture order (Invoice #${invoiceNo}) today, but were unable to complete the delivery.

📋 Reason: ${reason}
📅 Original Delivery Date: ${dateStr}

*What's next?*
We will contact you shortly to reschedule your delivery.

📞 Need immediate help? Call us: ${CUSTOMER_CARE_PHONE}

━━━━━━━━━━━━━━━━

عزيزي العميل،
حاولنا توصيل طلبك من الأثاث (فاتورة رقم ${invoiceNo}) اليوم، ولكن لم نتمكن من إتمام التوصيل.

📋 السبب: ${reasonArabic}
📅 تاريخ التوصيل الأصلي: ${dateStr}

*ما التالي؟*
سنتصل بك قريباً لإعادة جدولة التوصيل.

📞 تحتاج مساعدة فورية؟ اتصل بنا: ${CUSTOMER_CARE_PHONE}

We apologize for the inconvenience | نعتذر عن الإزعاج
*WWD Furniture*`;
};

/**
 * 3. Postponed/Rescheduled Delivery Message
 */
const generatePostponedDeliveryMessage = (invoiceNo, newDate, shift, driverName, driverPhone, reason) => {
  const dateStr = formatDate(newDate);
  const timeWindow = getTimeWindow(shift);
  
  return `📅 *Delivery Rescheduled* | إعادة جدولة التوصيل

Dear Customer,
Your furniture delivery (Invoice #${invoiceNo}) has been rescheduled.

🆕 *New Delivery Details:*
📅 Date: ${dateStr}
⏰ Time Window: ${timeWindow.english}
👤 Driver: ${driverName}
📱 Driver Contact: ${driverPhone}

${reason ? `📋 Reason: ${reason}` : ''}

💡 Please ensure someone is available at the delivery address.

━━━━━━━━━━━━━━━━

عزيزي العميل،
تم إعادة جدولة توصيل الأثاث (فاتورة رقم ${invoiceNo}).

🆕 *تفاصيل التوصيل الجديد:*
📅 التاريخ: ${dateStr}
⏰ الوقت المتوقع: ${timeWindow.arabic}
👤 السائق: ${driverName}
📱 هاتف السائق: ${driverPhone}

${reason ? `📋 السبب: ${reason}` : ''}

💡 يرجى التأكد من وجود شخص في عنوان التوصيل.

Thank you for your patience! | شكراً لصبرك
*WWD Furniture*`;
};

/**
 * 4. Replacement Scheduled Message
 */
const generateReplacementMessage = (invoiceNo, pickupDate, deliveryDate, shift, driverName, driverPhone, itemDescription) => {
  const pickupDateStr = formatDate(pickupDate);
  const deliveryDateStr = formatDate(deliveryDate);
  const timeWindow = getTimeWindow(shift);
  
  return `🔄 *Replacement Scheduled* | تم جدولة الاستبدال

Dear Customer,
We have scheduled a replacement for your furniture item (Invoice #${invoiceNo}).

🆕 *Replacement Details:*
📦 Item: ${itemDescription || 'Furniture Item'}
📅 Collection Date: ${pickupDateStr}
📅 New Delivery Date: ${deliveryDateStr}
⏰ Time Window: ${timeWindow.english}
👤 Driver: ${driverName}
📱 Driver Contact: ${driverPhone}

💡 *Important:* We will collect the old item and deliver the replacement on the same visit.

━━━━━━━━━━━━━━━━

عزيزي العميل،
تم جدولة استبدال قطعة الأثاث (فاتورة رقم ${invoiceNo}).

🆕 *تفاصيل الاستبدال:*
📦 المنتج: ${itemDescription || 'قطعة أثاث'}
📅 تاريخ الاستلام: ${pickupDateStr}
📅 تاريخ التوصيل الجديد: ${deliveryDateStr}
⏰ الوقت المتوقع: ${timeWindow.arabic}
👤 السائق: ${driverName}
📱 هاتف السائق: ${driverPhone}

💡 *مهم:* سنقوم باستلام المنتج القديم وتوصيل البديل في نفس الزيارة.

Thank you for your patience! | شكراً لصبرك
*WWD Furniture*`;
};

/**
 * 5. Delivery Completed Message
 */
const generateDeliveredMessage = (invoiceNo, deliveryDate, driverName) => {
  const dateStr = formatDate(deliveryDate);
  const timeStr = new Date(deliveryDate).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `✅ *Delivery Completed* | تم التوصيل بنجاح

Dear Customer,
Your furniture order (Invoice #${invoiceNo}) has been *successfully delivered*!

📅 Delivery Date: ${dateStr}
⏰ Delivery Time: ${timeStr}
👤 Delivered By: ${driverName}

We hope you enjoy your new furniture! 🎉

💡 *Need help with assembly or have any issues?*
📞 Contact us: ${CUSTOMER_CARE_PHONE}

━━━━━━━━━━━━━━━━

عزيزي العميل،
تم توصيل طلبك من الأثاث (فاتورة رقم ${invoiceNo}) *بنجاح*!

📅 تاريخ التوصيل: ${dateStr}
⏰ وقت التوصيل: ${timeStr}
👤 تم التوصيل بواسطة: ${driverName}

نتمنى أن تستمتع بأثاثك الجديد! 🎉

💡 *تحتاج مساعدة في التركيب أو لديك أي مشاكل؟*
📞 اتصل بنا: ${CUSTOMER_CARE_PHONE}

Thank you for choosing WWD Furniture! | شكراً لاختيارك WWD Furniture
*WWD Furniture*`;
};

/**
 * 6. Delivery On Hold Message
 */
const generateOnHoldMessage = (invoiceNo, reason, originalDate) => {
  const dateStr = formatDate(originalDate);
  
  return `⏸️ *Delivery On Hold* | التوصيل معلق

Dear Customer,
Your furniture delivery (Invoice #${invoiceNo}) is currently *on hold*.

📋 Reason: ${reason}
📅 Original Scheduled Date: ${dateStr}

*To resume your delivery:*
📞 Please contact us: ${CUSTOMER_CARE_PHONE}

━━━━━━━━━━━━━━━━

عزيزي العميل،
توصيل الأثاث (فاتورة رقم ${invoiceNo}) *معلق حالياً*.

📋 السبب: ${reason}
📅 التاريخ المجدول الأصلي: ${dateStr}

*لاستئناف التوصيل:*
📞 يرجى الاتصال بنا: ${CUSTOMER_CARE_PHONE}

Thank you! | شكراً لك
*WWD Furniture*`;
};

module.exports = {
  generateOutForDeliveryMessage,
  generateFailedDeliveryMessage,
  generatePostponedDeliveryMessage,
  generateReplacementMessage,
  generateDeliveredMessage,
  generateOnHoldMessage,
  CUSTOMER_CARE_PHONE
};





# 📱 WhatsApp Notification System Guide

## Overview
Your delivery tracking system now includes automatic WhatsApp notifications for customers. Here's how it works:

## 🚚 Notification Types

### 1. **Out for Delivery Notification**
**When:** Automatically sent when you upload a trip sheet
**Message includes:**
- Driver name and phone number
- Instructions to be available for delivery
- Professional, friendly tone

**Example Message:**
```
🚚 *Your order is out for delivery!*

Driver: Anwar Midex
Phone: 0546067629

Please be available to receive your delivery. The driver will contact you when they arrive.

Thank you for choosing our service! 🙏
```

### 2. **Not Delivered Notification**
**When:** Sent when delivery status is updated to "Not Delivered"
**Message includes:**
- Reason for failed delivery
- Next steps (redelivery tomorrow)
- Apology and contact information

**Example Message:**
```
❌ *Delivery Update*

We were unable to deliver your order today due to: Customer not available

🔄 *Next Steps:*
• We will attempt delivery again tomorrow
• Please ensure someone is available to receive the order
• Contact our supervisor if you need to reschedule

We apologize for any inconvenience. 🙏
```

### 3. **Damage Case Notification**
**When:** Sent when delivery status is updated to "Damage Case"
**Message includes:**
- CRM number for tracking
- Timeline for replacement
- Next delivery notification promise

**Example Message:**
```
🔧 *Replacement Request Processed*

Your replacement request has been processed:
• CRM Number: CRM240917001
• New item will be delivered within 2 business days
• You will receive a notification when it's out for delivery

Thank you for your patience! 🙏
```

## 🔄 How It Works

### Automatic Notifications
1. **Upload Trip Sheet** → All customers get "Out for Delivery" notifications
2. **Update Delivery Status** → Customer gets appropriate notification based on status

### Phone Number Handling
- Automatically formats Saudi phone numbers (+966 prefix)
- Sends to both primary (phone1) and secondary (phone2) numbers if available
- Handles different phone number formats

## 🧪 Testing the System

### Test Notifications
```bash
cd backend
node scripts/testNotifications.js
```

### Test with Real Data
1. Upload a trip sheet PDF
2. Check console logs for notification results
3. Update delivery statuses to test different scenarios

## 📊 Notification Results

When you upload a trip sheet, you'll see:
```json
{
  "success": true,
  "message": "Trip sheet uploaded and processed successfully",
  "data": [
    {
      "tripSheetId": "...",
      "driver": {
        "name": "Anwar Midex",
        "truckNo": "436 TJB-9941",
        "phone": "0546067629"
      },
      "deliveries": 14,
      "notifications": [
        {
          "customer": "Agharid Abdel Hamid Maghribi",
          "phone": "541905151",
          "status": "sent",
          "messageId": "msg_1758089411454"
        }
      ]
    }
  ],
  "totalDeliveries": 14
}
```

## 🔧 Production Setup

### Current Status: Development Mode
- Notifications are logged to console
- No actual WhatsApp messages sent
- Perfect for testing and development

### For Production:
1. **Get WhatsApp Business API Access**
   - Apply for WhatsApp Business API
   - Get API credentials and phone number

2. **Update WhatsApp Utility**
   - Replace console logging with actual API calls
   - Add error handling and retry logic
   - Implement rate limiting

3. **Example Integration:**
```javascript
// Replace in utils/whatsapp.js
const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return { success: false, error: error.message };
  }
};
```

## 📱 Customer Experience

### What Customers Receive:
1. **Immediate notification** when their order is out for delivery
2. **Driver contact information** to coordinate delivery
3. **Clear next steps** if delivery fails
4. **Professional, branded messages** with emojis and formatting

### Benefits:
- ✅ Improved customer satisfaction
- ✅ Reduced missed deliveries
- ✅ Better communication
- ✅ Professional image
- ✅ Automated process (no manual work)

## 🚀 Next Steps

1. **Test the system** with your trip sheet PDFs
2. **Customize messages** if needed (edit `utils/whatsapp.js`)
3. **Set up WhatsApp Business API** for production
4. **Monitor notification success rates**
5. **Add more notification types** as needed

## 📞 Support

If you need help with:
- Setting up WhatsApp Business API
- Customizing message templates
- Adding new notification types
- Troubleshooting issues

Just let me know! The system is ready to use and can be easily customized for your specific needs.

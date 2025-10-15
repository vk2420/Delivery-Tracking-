# Real-time Delivery Tracking System - Quick Summary for AI Assistants

## 🎯 What This System Does

A **furniture delivery tracking system** that:
1. Parses PDF trip sheets to extract delivery data
2. Automatically sends WhatsApp notifications to customers
3. Manages deliveries with proper shift timings (Morning: 10 AM-3 PM, Afternoon: 3 PM-8 PM)
4. Ensures ONE delivery per invoice with correct customer mapping

---

## 🏗️ Tech Stack

**Backend**: Node.js + Express + MongoDB + Mongoose  
**PDF Processing**: pdf-parse (regex-based extraction)  
**WhatsApp**: whatsapp-web.js + Puppeteer  
**Frontend**: React.js  

---

## 📂 Key Files & Their Purpose

### Core Business Logic
1. **`backend/utils/aiPdfParser.js`** (MOST CRITICAL)
   - Parses PDF using regex patterns
   - Groups data by phone number first
   - Creates **ONE delivery per invoice** (not per phone)
   - Detects shift: "Morning" or "Afternoon"
   
2. **`backend/routes/upload.js`**
   - Handles PDF upload
   - Processes parsed data
   - Creates database records
   - Triggers WhatsApp notifications

3. **`backend/utils/whatsappWeb.js`**
   - Manages WhatsApp Web client
   - QR code authentication
   - Message sending with retry (3 attempts)

4. **`backend/utils/whatsapp.js`**
   - Generates bilingual messages (English + Arabic)
   - Sets correct time window based on shift

### Database Models
- **Driver**: `{ name, phone, vehicleNumber }`
- **Customer**: `{ name, phone1, phone2, address }`
- **Delivery**: `{ customerId, driverId, invoiceNo, items, status, shift, startTime, endTime }`
- **TripSheet**: `{ driverId, deliveries[], date, shift, pdfPath }`

---

## ⚙️ How It Works (Workflow)

```
1. User uploads PDF trip sheet
   ↓
2. PDF Parser extracts:
   - Driver info (name, phone)
   - For each invoice: customer name, phone, address, shift
   ↓
3. Group by phone number (to avoid duplicate customers)
   ↓
4. Create ONE delivery per invoice (CRITICAL RULE)
   ↓
5. Database operations:
   - Find/create driver
   - Create trip sheet
   - For each invoice:
     * Find/create customer (by phone)
     * Create delivery record
     * Send WhatsApp notification
   ↓
6. WhatsApp message sent with:
   - Correct time window (Morning: 10-3, Afternoon: 3-8)
   - Driver details
   - Invoice number
   - Bilingual text
```

---

## 🔑 Critical Business Rules

### 1. **One Delivery Per Invoice**
```javascript
// ❌ WRONG: Group all invoices for same customer into one delivery
// ✅ CORRECT: Create separate delivery for each invoice

// Implementation in aiPdfParser.js:
for (const [phone1, group] of phoneGroups) {
  for (const invoiceNo of group.invoices) {
    deliveries.push({
      invoiceNo: invoiceNo,  // One invoice per delivery
      customerName: group.customerName,
      phone1: phone1,
      shift: group.shift,
      // ...
    });
  }
}
```

### 2. **Shift Time Windows**
```javascript
// Morning shift: 10:00 AM - 3:00 PM
// Afternoon shift: 3:00 PM - 8:00 PM

if (shift.toLowerCase() === 'morning') {
  timeWindow = '10:00 AM to 3:00 PM';
} else {
  timeWindow = '3:00 PM to 8:00 PM';
}
```

### 3. **Shift Detection**
```javascript
// Regex pattern (case-insensitive)
const shiftMatch = line.match(/\b(Afternoon|Morning|morning|afternoon)\b/i);

// Normalization
if (shiftMatch[1].toLowerCase() === 'morning') {
  shift = 'Morning';
} else if (shiftMatch[1].toLowerCase() === 'afternoon') {
  shift = 'Afternoon';
}

// Default if not found: 'Afternoon'
```

### 4. **Phone Number Formatting**
```javascript
// Input: "0555623834" (Saudi Arabia format)
// WhatsApp format: "+9660555623834@c.us"

formatPhoneNumber(phone) {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  return `+966${cleanPhone}@c.us`;
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Wrong Customer-Invoice Mapping
**Symptom**: Invoice sent to wrong customer  
**Cause**: Grouping deliveries by phone instead of creating one per invoice  
**Fix**: Check `aiPdfParser.js` - ensure separate delivery for each invoice

### Issue 2: All Customers Get Same Time (3-8 PM)
**Symptom**: Morning deliveries show afternoon time  
**Cause**: Shift detection regex or logic error  
**Fix**: 
- Verify regex: `/\b(Afternoon|Morning|morning|afternoon)\b/i`
- Check comparison: `=== 'morning'` or `=== 'afternoon'`
- Ensure loop doesn't break before finding shift

### Issue 3: WhatsApp Not Sending
**Symptom**: Messages logged but not sent  
**Cause**: WhatsApp client not initialized or not ready  
**Fix**:
1. Check if QR code scanned
2. Verify `whatsappWebService.isReady === true`
3. Re-initialize client if needed

### Issue 4: Chrome SingletonLock Error
**Symptom**: `Failed to create SingletonLock: File exists`  
**Cause**: Multiple Chrome instances or crashed process  
**Fix**:
```bash
pkill -9 chrome && pkill -9 node
rm -rf backend/.wwebjs_auth
node server.js
```

### Issue 5: Port Already in Use
**Symptom**: `EADDRINUSE: address already in use :::3001`  
**Cause**: Server already running  
**Fix**:
```bash
lsof -ti:3001 | xargs kill -9
```

---

## 📊 Data Flow Example

### Input PDF Contains:
```
Driver: Ahmed Ali
Phone: 0501234567

Invoice #40124503933920250922
Customer Name: Mohammed Hassan
Phone: 0555623834
Address: Riyadh, Al-Malaz District
Shift: Morning

Invoice #40124500161320250909
Customer Name: Mohammed Hassan
Phone: 0555623834
Address: Riyadh, Al-Malaz District
Shift: Morning
```

### Parser Output:
```javascript
{
  driverName: "Ahmed Ali",
  driverPhone: "0501234567",
  deliveries: [
    {
      invoiceNo: "40124503933920250922",
      customerName: "Mohammed Hassan",
      phone1: "0555623834",
      address: "Riyadh, Al-Malaz District",
      shift: "Morning",
      allInvoices: ["40124503933920250922"]
    },
    {
      invoiceNo: "40124500161320250909",
      customerName: "Mohammed Hassan",
      phone1: "0555623834",
      address: "Riyadh, Al-Malaz District",
      shift: "Morning",
      allInvoices: ["40124500161320250909"]
    }
  ]
}
```

### Database Creates:
- 1 Driver: Ahmed Ali
- 1 Customer: Mohammed Hassan (0555623834)
- 2 Deliveries: One for each invoice
- 1 Trip Sheet: Contains both deliveries

### WhatsApp Sends:
- 2 Messages to 0555623834 (one per invoice)
- Each with time: "10:00 AM to 3:00 PM" (Morning shift)

---

## 🔧 PDF Parsing Regex Patterns

```javascript
// Invoice number
/Invoice\s*[:#]?\s*(\d+)/i

// Customer name
/Customer\s*Name\s*[:#]?\s*(.+)/i

// Phone (10 digits)
/(\d{10})/

// Address
/Address\s*[:#]?\s*(.+)/i

// Shift (case-insensitive, word boundary)
/\b(Afternoon|Morning|morning|afternoon)\b/i

// Driver name
/Driver\s*[:#]?\s*(.+)/i

// Driver phone
/Driver\s*Phone\s*[:#]?\s*(\d{10})/i
```

---

## 🚀 API Endpoints Quick Reference

```bash
# Upload trip sheet PDF
POST /api/upload/tripsheet
Content-Type: multipart/form-data
Field name: tripSheet

# Get all drivers
GET /api/drivers

# Get deliveries (with filters)
GET /api/deliveries?status=Out for Delivery

# Update delivery status
PATCH /api/deliveries/:id
Body: { "status": "Delivered" }

# Health check
GET /api/health
```

---

## 🔐 Environment Setup

```bash
# Install dependencies
cd backend
npm install

# Environment variables (.env)
MONGODB_URI=mongodb://localhost:27017/delivery-tracking
PORT=3001

# Start MongoDB
mongod

# Start server
node server.js

# Scan WhatsApp QR code when prompted
```

---

## 📱 WhatsApp Message Template

```
🚚 Delivery Notification | إشعار التسليم

Dear Customer,
Your furniture order (Invoice #{invoiceNo}) is out for delivery.

📅 Expected Delivery: {timeWindow}
👤 Driver: {driverName}
📱 Driver Contact: {driverPhone}

عزيزي العميل،
طلبك من الأثاث (فاتورة رقم {invoiceNo}) في طريقه للتوصيل.

📅 التوصيل المتوقع: {timeWindowArabic}
👤 السائق: {driverName}
📱 هاتف السائق: {driverPhone}

Thank you! | شكراً لك
```

---

## ⚠️ Things to NEVER Do

1. ❌ **Don't group multiple invoices into one delivery**
   - Always create one delivery per invoice

2. ❌ **Don't hardcode shift times**
   - Always detect from PDF or use default "Afternoon"

3. ❌ **Don't send WhatsApp without checking client.isReady**
   - Always verify connection before sending

4. ❌ **Don't commit `.wwebjs_auth` to git**
   - This contains WhatsApp session data

5. ❌ **Don't modify PDF parser without understanding grouping logic**
   - Phone grouping → Invoice splitting is critical

---

## 🧪 Testing Checklist

- [ ] Upload PDF with multiple invoices for same customer
- [ ] Verify separate delivery created for each invoice
- [ ] Check Morning shift shows "10 AM - 3 PM"
- [ ] Check Afternoon shift shows "3 PM - 8 PM"
- [ ] Confirm WhatsApp messages sent to correct phones
- [ ] Verify invoice-customer mapping is accurate
- [ ] Test with PDFs containing different shift keywords
- [ ] Check database has correct relationships

---

## 📞 Debugging Tips

### Enable Debug Logging
Already present in key files:
- `aiPdfParser.js`: Shows shift detection, invoice grouping
- `whatsapp.js`: Shows time window selection
- `upload.js`: Shows delivery creation

### Check Logs For:
```
✅ Created delivery for [customer] (Invoice: [X], Shift: [Y])
🕐 DEBUG: Generating message for invoice [X], Shift: [Y]
🌅 DEBUG: Using MORNING time window: 10:00 AM to 3:00 PM
📤 Sending WhatsApp message to [phone]
✅ WhatsApp message sent successfully to [phone]
```

### If Issues Persist:
1. Check PDF text extraction: `console.log(pdfData.text)`
2. Verify regex matches: Test patterns individually
3. Check database records: Use MongoDB Compass
4. Test WhatsApp client: Send test message manually

---

## 🎓 Learning Resources

- **WhatsApp Web.js**: https://wwebjs.dev/
- **Puppeteer**: https://pptr.dev/
- **Mongoose**: https://mongoosejs.com/
- **pdf-parse**: https://www.npmjs.com/package/pdf-parse

---

**When helping with this system, always remember:**
1. One delivery per invoice (not per customer)
2. Shift detection determines time window
3. WhatsApp client must be ready before sending
4. Phone number grouping prevents duplicate customers
5. All messages are bilingual (English + Arabic)

---

**System Status**: ✅ Production Ready  
**Last Verified**: October 1, 2025


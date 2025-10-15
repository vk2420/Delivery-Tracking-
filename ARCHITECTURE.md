# Real-time Delivery Tracking System - Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [PDF Parsing Logic](#pdf-parsing-logic)
9. [WhatsApp Integration](#whatsapp-integration)
10. [Key Business Rules](#key-business-rules)
11. [Error Handling](#error-handling)
12. [Deployment & Configuration](#deployment--configuration)

---

## 🎯 System Overview

### Purpose
A delivery management system that:
- Parses PDF trip sheets to extract delivery information
- Automatically sends WhatsApp notifications to customers
- Tracks delivery status in real-time
- Manages drivers, customers, and delivery schedules

### Key Features
- **Automated PDF Processing**: Extracts customer, driver, and delivery data from uploaded PDF trip sheets
- **WhatsApp Notifications**: Sends delivery time windows and driver details to customers
- **Shift Management**: Handles Morning (10 AM - 3 PM) and Afternoon (3 PM - 8 PM) delivery slots
- **Invoice Tracking**: One delivery per invoice with proper customer-invoice mapping
- **Real-time Updates**: Track delivery status and driver locations

---

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js (v23.7.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **PDF Processing**: pdf-parse library
- **WhatsApp Integration**: whatsapp-web.js + Puppeteer
- **File Upload**: Multer middleware
- **Environment**: dotenv for configuration

### Frontend
- **Framework**: React.js
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Routing**: React Router

### DevOps
- **Process Management**: Node.js native
- **Browser Automation**: Puppeteer (ARM64 compatible)
- **Session Storage**: File-based (.wwebjs_auth)

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Upload PDF   │  │ View Drivers │  │ Track Status │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP/REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                             │  │
│  │  • /api/upload/tripsheet (POST)                          │  │
│  │  • /api/drivers (GET, POST)                              │  │
│  │  • /api/deliveries (GET, PATCH)                          │  │
│  │  • /api/customers (GET)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  PDF Parser      │  │  WhatsApp Web    │                    │
│  │  (aiPdfParser)   │  │  Service         │                    │
│  │                  │  │                  │                    │
│  │  • Regex Extract │  │  • QR Auth       │                    │
│  │  • Group by      │  │  • Message Send  │                    │
│  │    Invoice       │  │  • Retry Logic   │                    │
│  │  • Shift Detect  │  │  • Session Mgmt  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Database Models                          │  │
│  │  • Driver  • Customer  • Delivery  • TripSheet           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ Mongoose ODM
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                            │
│  Collections: drivers, customers, deliveries, tripsheets        │
└─────────────────────────────────────────────────────────────────┘
                                  
                                  │ WhatsApp Web Protocol
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WhatsApp Business API                        │
│              (via whatsapp-web.js + Puppeteer)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Components

### 1. PDF Parser (`backend/utils/aiPdfParser.js`)

**Purpose**: Extract structured data from PDF trip sheets

**Key Functions**:
- `parseTripSheet(buffer)`: Main entry point for PDF parsing
- `extractDataWithRegex(text)`: Regex-based extraction of customer, driver, and delivery data

**Parsing Strategy**:
```javascript
// Line-by-line regex matching
const patterns = {
  invoiceNo: /Invoice\s*[:#]?\s*(\d+)/i,
  customerName: /Customer\s*Name\s*[:#]?\s*(.+)/i,
  phone1: /(\d{10})/,  // Primary phone
  address: /Address\s*[:#]?\s*(.+)/i,
  shift: /\b(Afternoon|Morning)\b/i
};
```

**Grouping Logic**:
- Group all invoices by phone number first
- Then create **one delivery per invoice** (not per phone number)
- Each delivery has unique invoice-customer mapping

**Output Format**:
```javascript
{
  driverName: "Ahmed Ali",
  driverPhone: "0501234567",
  deliveries: [
    {
      invoiceNo: "40124503933920250922",
      customerName: "Mohammed Hassan",
      phone1: "0555623834",
      phone2: "",
      address: "Riyadh, Al-Malaz District",
      shift: "Morning",
      items: [{ name: "WWD Furniture Item", quantity: 1 }],
      allInvoices: ["40124503933920250922"]
    }
  ]
}
```

### 2. WhatsApp Web Service (`backend/utils/whatsappWeb.js`)

**Purpose**: Manage WhatsApp Web connection and message sending

**Key Features**:
- QR Code authentication
- Session persistence
- Retry logic (3 attempts with 2s delay)
- Graceful shutdown

**Initialization**:
```javascript
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'delivery-portal-whatsapp'
  }),
  puppeteer: {
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});
```

**Message Sending**:
- Formats phone number: `+966${phone}@c.us`
- Sends bilingual messages (English + Arabic)
- Includes driver name, phone, delivery time window

### 3. Message Generator (`backend/utils/whatsapp.js`)

**Purpose**: Create WhatsApp messages with correct delivery times

**Shift Detection**:
```javascript
if (shift.toLowerCase() === 'morning') {
  timeWindow = '10:00 AM to 3:00 PM';
  timeWindowArabic = '10:00 صباحاً إلى 3:00 مساءً';
} else {
  timeWindow = '3:00 PM to 8:00 PM';
  timeWindowArabic = '3:00 مساءً إلى 8:00 مساءً';
}
```

**Message Template**:
```
🚚 Delivery Notification | إشعار التسليم

Dear Customer,
Your furniture order (Invoice #40124503933920250922) is out for delivery.

📅 Expected Delivery: 10:00 AM to 3:00 PM
👤 Driver: Ahmed Ali
📱 Driver Contact: 0501234567

عزيزي العميل،
طلبك من الأثاث (فاتورة رقم 40124503933920250922) في طريقه للتوصيل.

📅 التوصيل المتوقع: 10:00 صباحاً إلى 3:00 مساءً
👤 السائق: Ahmed Ali
📱 هاتف السائق: 0501234567

Thank you! | شكراً لك
```

### 4. Upload Route (`backend/routes/upload.js`)

**Purpose**: Handle PDF uploads and trigger notifications

**Workflow**:
1. Receive PDF file via Multer
2. Parse PDF using `aiPdfParser`
3. Find/create driver in database
4. Create trip sheet record
5. Group deliveries by invoice number
6. For each invoice:
   - Find/create customer
   - Create delivery record
   - Send WhatsApp notification
7. Link all deliveries to trip sheet
8. Return success response

**Invoice Grouping**:
```javascript
// Group by invoice to ensure one delivery per invoice
const invoiceGroups = {};
for (const deliveryData of tripData.deliveries) {
  const invoiceKey = deliveryData.invoiceNo;
  if (!invoiceGroups[invoiceKey]) {
    invoiceGroups[invoiceKey] = {
      customerName: deliveryData.customerName,
      phone1: deliveryData.phone1,
      phone2: deliveryData.phone2,
      address: deliveryData.address,
      shift: deliveryData.shift,
      items: [],
      allInvoices: [deliveryData.invoiceNo]
    };
  }
  // Add items if present
  if (deliveryData.items && deliveryData.items.length > 0) {
    invoiceGroups[invoiceKey].items.push(...deliveryData.items);
  }
}
```

---

## 🗄️ Database Schema

### Driver Model
```javascript
{
  name: String,          // "Ahmed Ali"
  phone: String,         // "0501234567"
  email: String,         // Optional
  vehicleNumber: String, // Optional
  isActive: Boolean,     // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Customer Model
```javascript
{
  name: String,          // "Mohammed Hassan"
  phone1: String,        // "0555623834" (Primary)
  phone2: String,        // Optional (Secondary)
  address: String,       // "Riyadh, Al-Malaz District"
  createdAt: Date,
  updatedAt: Date
}
```

### Delivery Model
```javascript
{
  customerId: ObjectId,       // Reference to Customer
  driverId: ObjectId,         // Reference to Driver
  tripSheetId: ObjectId,      // Reference to TripSheet
  invoiceNo: String,          // "40124503933920250922"
  allInvoices: [String],      // Array of related invoices
  items: [{
    name: String,
    quantity: Number,
    description: String
  }],
  status: String,             // "Pending" | "Out for Delivery" | "Delivered" | "Failed"
  shift: String,              // "Morning" | "Afternoon"
  startTime: String,          // "10:00 AM"
  endTime: String,            // "3:00 PM"
  actualDeliveryTime: Date,   // Optional
  deliveryNotes: String,      // Optional
  createdAt: Date,
  updatedAt: Date
}
```

### TripSheet Model
```javascript
{
  driverId: ObjectId,         // Reference to Driver
  deliveries: [ObjectId],     // Array of Delivery references
  date: Date,                 // Trip date
  shift: String,              // "Morning" | "Afternoon"
  startTime: String,          // "10:00 AM"
  endTime: String,            // "3:00 PM"
  status: String,             // "Active" | "Completed"
  pdfPath: String,            // Path to uploaded PDF
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Data Flow

### PDF Upload & Processing Flow

```
1. User uploads PDF
   ↓
2. Multer saves to /uploads
   ↓
3. PDF Parser extracts data
   - Driver info
   - Customer info (per invoice)
   - Delivery details
   - Shift information
   ↓
4. Database Operations
   - Find/Create Driver
   - Create TripSheet
   - For each invoice:
     * Find/Create Customer (by phone)
     * Create Delivery
     * Link to TripSheet
   ↓
5. WhatsApp Notifications
   - For each delivery:
     * Generate message (correct shift time)
     * Send to customer phone
     * Retry up to 3 times if failed
   ↓
6. Response to Frontend
   - Success/Failure status
   - Created deliveries count
   - Sent messages count
```

### WhatsApp Message Flow

```
1. Delivery Created
   ↓
2. generateDeliveryMessage()
   - Determine shift (Morning/Afternoon)
   - Set time window (10-3 or 3-8)
   - Format bilingual message
   ↓
3. sendWhatsAppMessage()
   - Format phone: +966XXXXXXXXXX@c.us
   - Call whatsappWebService
   ↓
4. whatsappWebService.sendMessageWithRetry()
   - Check if client is ready
   - Attempt 1: Send message
   - If failed: Wait 2s
   - Attempt 2: Send message
   - If failed: Wait 2s
   - Attempt 3: Send message
   - Return success/failure
   ↓
5. Log result
   - Success: "✅ Sent to [phone]"
   - Failure: "❌ Failed after 3 attempts"
```

---

## 🔌 API Endpoints

### Upload Trip Sheet
```
POST /api/upload/tripsheet
Content-Type: multipart/form-data

Body:
  - tripSheet: PDF file

Response:
{
  "success": true,
  "message": "Trip sheet processed successfully",
  "data": {
    "tripSheetId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "driverName": "Ahmed Ali",
    "deliveriesCount": 5,
    "messagesSent": 5
  }
}
```

### Get All Drivers
```
GET /api/drivers

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Ahmed Ali",
      "phone": "0501234567",
      "isActive": true
    }
  ]
}
```

### Get All Deliveries
```
GET /api/deliveries?status=Out for Delivery

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "invoiceNo": "40124503933920250922",
      "customer": {
        "name": "Mohammed Hassan",
        "phone1": "0555623834"
      },
      "driver": {
        "name": "Ahmed Ali",
        "phone": "0501234567"
      },
      "status": "Out for Delivery",
      "shift": "Morning"
    }
  ]
}
```

### Update Delivery Status
```
PATCH /api/deliveries/:id

Body:
{
  "status": "Delivered",
  "deliveryNotes": "Delivered successfully"
}

Response:
{
  "success": true,
  "message": "Delivery updated successfully",
  "data": { /* updated delivery */ }
}
```

### Health Check
```
GET /api/health

Response:
{
  "success": true,
  "message": "Delivery Portal API is running",
  "timestamp": "2025-10-01T04:44:46.002Z"
}
```

---

## 📄 PDF Parsing Logic

### Regex Patterns Used

```javascript
const patterns = {
  // Invoice number: "Invoice #40124503933920250922"
  invoiceNo: /Invoice\s*[:#]?\s*(\d+)/i,
  
  // Customer name: "Customer Name: Mohammed Hassan"
  customerName: /Customer\s*Name\s*[:#]?\s*(.+)/i,
  
  // Phone (10 digits): "0555623834"
  phone1: /(\d{10})/,
  
  // Address: "Address: Riyadh, Al-Malaz District"
  address: /Address\s*[:#]?\s*(.+)/i,
  
  // Shift: "Morning" or "Afternoon"
  shift: /\b(Afternoon|Morning|morning|afternoon)\b/i,
  
  // Driver name: "Driver: Ahmed Ali"
  driverName: /Driver\s*[:#]?\s*(.+)/i,
  
  // Driver phone: "Driver Phone: 0501234567"
  driverPhone: /Driver\s*Phone\s*[:#]?\s*(\d{10})/i
};
```

### Parsing Algorithm

1. **Extract text from PDF** using `pdf-parse`
2. **Find driver information** (first occurrence in document)
3. **Split text into lines**
4. **For each invoice found**:
   - Search surrounding lines for customer data
   - Look backwards and forwards up to 15 lines
   - Extract: name, phone, address, shift
   - Store in temporary group by phone number
5. **Group by phone number** to avoid duplicates
6. **Create one delivery per invoice** from the groups
7. **Return structured data**

### Shift Detection Logic

```javascript
// Search for shift in surrounding lines
const shiftMatch = searchLine.match(/\b(Afternoon|Morning|morning|afternoon)\b/i);
if (shiftMatch) {
  const foundShift = shiftMatch[1].toLowerCase();
  if (foundShift === 'morning') {
    shift = 'Morning';
  } else if (foundShift === 'afternoon') {
    shift = 'Afternoon';
  }
}
```

**Default**: If no shift found, defaults to "Afternoon"

---

## 📱 WhatsApp Integration

### Authentication Flow

```
1. Server starts
   ↓
2. WhatsApp Web client initializes
   ↓
3. Check for saved session (.wwebjs_auth)
   ├─ Session exists → Auto login
   └─ No session → Generate QR code
   ↓
4. User scans QR with WhatsApp mobile
   ↓
5. Session saved for future use
   ↓
6. Client ready to send messages
```

### Session Management

- **Storage**: `.wwebjs_auth/session-delivery-portal-whatsapp/`
- **Persistence**: Sessions persist across server restarts
- **Security**: Local file-based authentication
- **Cleanup**: On server shutdown, properly close client

### Message Retry Logic

```javascript
async sendMessageWithRetry(phone, message, retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('WhatsApp client not ready');
      }
      
      const formattedPhone = this.formatPhoneNumber(phone);
      await this.client.sendMessage(formattedPhone, message);
      
      return { success: true };
    } catch (error) {
      if (attempt === retries) {
        return { success: false, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Phone Number Formatting

```javascript
// Input: "0555623834"
// Output: "+9660555623834@c.us"
formatPhoneNumber(phone) {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  return `+966${cleanPhone}@c.us`;
}
```

---

## ⚖️ Key Business Rules

### 1. Invoice-Customer Mapping
- **Rule**: Each invoice maps to exactly ONE customer
- **Implementation**: Create one delivery per invoice number
- **Reason**: Prevents wrong customer-invoice associations

### 2. Shift Time Windows
- **Morning Shift**: 10:00 AM - 3:00 PM
- **Afternoon Shift**: 3:00 PM - 8:00 PM
- **Default**: If shift not detected, use "Afternoon"

### 3. Customer Phone Number
- **Primary (phone1)**: Required, used for WhatsApp
- **Secondary (phone2)**: Optional
- **Format**: 10 digits starting with 0 (e.g., 0555623834)

### 4. Message Sending
- **When**: Immediately after delivery creation
- **Language**: Bilingual (English + Arabic)
- **Retry**: Up to 3 attempts with 2s delay
- **Logging**: All attempts logged for debugging

### 5. Delivery Status Flow
```
Pending → Out for Delivery → Delivered
              ↓
           Failed (if delivery unsuccessful)
```

### 6. Trip Sheet Rules
- One trip sheet per PDF upload
- Contains multiple deliveries
- Linked to one driver
- Has a specific date and shift

---

## 🛡️ Error Handling

### PDF Parsing Errors
```javascript
try {
  const pdfData = await pdf(buffer);
  const extractedData = await extractDataWithRegex(pdfData.text);
  return extractedData;
} catch (error) {
  console.error('❌ Error parsing PDF:', error);
  throw new Error(`PDF parsing failed: ${error.message}`);
}
```

### WhatsApp Connection Errors

**Singleton Lock Error**:
```bash
# Problem: Chrome process already running
# Solution: Kill processes and clear lock files
pkill -9 chrome && pkill -9 node
rm -rf .wwebjs_auth
```

**Client Not Ready**:
```javascript
if (!this.client || !this.isReady) {
  console.log('⚠️ WhatsApp client not ready, message queued');
  return { success: false, error: 'Client not ready' };
}
```

### Database Errors
```javascript
try {
  const delivery = new Delivery(deliveryData);
  await delivery.save();
} catch (error) {
  console.error('❌ Error saving delivery:', error);
  throw new Error(`Database error: ${error.message}`);
}
```

### Upload Errors

**MulterError: Unexpected field**:
- **Cause**: Field name mismatch
- **Solution**: Ensure form field is named `tripSheet`

**File too large**:
- **Limit**: 10MB (configurable in Multer)
- **Response**: 400 Bad Request

---

## 🚀 Deployment & Configuration

### Environment Variables (.env)

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/delivery-tracking

# Server
PORT=3001
NODE_ENV=production

# WhatsApp (optional settings)
WHATSAPP_SESSION_NAME=delivery-portal-whatsapp
CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads
```

### Server Startup

```bash
# Development
cd backend
node server.js

# Production (with PM2)
pm2 start server.js --name delivery-backend
pm2 save
pm2 startup
```

### Important Directories

```
backend/
├── .wwebjs_auth/           # WhatsApp session data (auto-created)
├── uploads/                # Uploaded PDF files
├── models/                 # Mongoose models
├── routes/                 # API routes
└── utils/                  # Utilities (parser, WhatsApp)
```

### Startup Checklist

1. ✅ MongoDB running (port 27017)
2. ✅ Node.js installed (v18+)
3. ✅ npm dependencies installed
4. ✅ .env file configured
5. ✅ Chrome installed (for Puppeteer)
6. ✅ Port 3001 available
7. ✅ WhatsApp mobile app ready to scan QR

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `EADDRINUSE: port 3001` | `lsof -ti:3001 \| xargs kill -9` |
| Chrome `SingletonLock` error | `pkill -9 chrome && rm -rf .wwebjs_auth` |
| WhatsApp not sending | Re-scan QR code, check client status |
| PDF parsing fails | Verify PDF format matches regex patterns |
| Wrong delivery times | Check shift detection logic in parser |

---

## 📊 Performance Considerations

### PDF Processing
- **Average time**: 2-3 seconds per PDF
- **Max file size**: 10MB
- **Concurrent uploads**: Limited by MongoDB connection pool

### WhatsApp Messaging
- **Rate limit**: ~10 messages/second (WhatsApp restriction)
- **Retry delay**: 2 seconds between attempts
- **Queue**: Messages sent synchronously during upload

### Database Queries
- **Indexes**: On phone1 (Customer), invoiceNo (Delivery)
- **Population**: Deliveries populate customer and driver refs
- **Pagination**: Implement for large datasets

---

## 🔐 Security Considerations

### File Upload
- Validate file type (PDF only)
- Limit file size (10MB)
- Sanitize file names
- Store in isolated directory

### Database
- Use Mongoose schema validation
- Sanitize user inputs
- Implement authentication (future)

### WhatsApp
- Session files are sensitive
- Don't commit `.wwebjs_auth` to git
- Implement rate limiting (future)

### API
- CORS configuration
- Input validation
- Error message sanitization

---

## 📈 Future Enhancements

1. **Authentication & Authorization**
   - Admin login
   - Role-based access control

2. **Real-time Tracking**
   - WebSocket integration
   - Driver GPS tracking
   - Live delivery status updates

3. **Analytics Dashboard**
   - Delivery success rate
   - Driver performance metrics
   - Customer satisfaction tracking

4. **Advanced Features**
   - Route optimization
   - Delivery scheduling
   - Multi-language support
   - Customer feedback system

5. **Mobile App**
   - Driver mobile app
   - Real-time navigation
   - Proof of delivery (photo/signature)

---

## 📝 Notes

### Critical Files
- `backend/utils/aiPdfParser.js` - PDF extraction logic
- `backend/utils/whatsappWeb.js` - WhatsApp connection
- `backend/routes/upload.js` - Main upload workflow
- `backend/models/Delivery.js` - Core data model

### Testing
- Test with real PDF trip sheets
- Verify shift detection accuracy
- Check invoice-customer mapping
- Test WhatsApp message delivery

### Maintenance
- Clear old uploads periodically
- Monitor MongoDB storage
- Check WhatsApp session validity
- Review error logs regularly

---

## 🤝 Contributing

When modifying this system:
1. Understand the invoice-per-delivery rule
2. Test shift detection thoroughly
3. Verify WhatsApp message format
4. Check PDF parsing with various formats
5. Update this documentation

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅


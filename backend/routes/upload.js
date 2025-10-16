const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseTripSheetWithAI } = require('../utils/aiPdfParser');
// No WhatsApp functionality - removed all WhatsApp imports
const Driver = require('../models/Driver');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const TripSheet = require('../models/TripSheet');

const router = express.Router();

// Configure multer for file uploads
// Use /tmp for Vercel serverless, uploads/ for local
const getUploadDir = () => {
  return process.env.VERCEL ? '/tmp/' : 'uploads/';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `tripsheet_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload and parse PDF
router.post('/upload', upload.single('tripSheet'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Read the uploaded file
    const fileBuffer = fs.readFileSync(req.file.path);
    
    // Save a copy for debugging
    const debugPath = path.join(__dirname, '..', 'uploads', `debug_${Date.now()}.pdf`);
    fs.copyFileSync(req.file.path, debugPath);
    console.log('🔍 Saved debug copy:', debugPath);
    
    // Parse the PDF using AI-powered parser
    console.log('🤖 Using AI-powered PDF parser...');
    console.log('📄 File size:', fileBuffer.length, 'bytes');
    const parseResult = await parseTripSheetWithAI(fileBuffer);
    console.log('📊 Parse method used:', parseResult.method);
    console.log('📊 Parse success:', parseResult.success);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Failed to parse PDF', details: parseResult.error });
    }

    const tripSheets = parseResult.tripSheets || parseResult.deliveries || [];
    const processedData = [];

    console.log('Processing trip sheets:', JSON.stringify(tripSheets, null, 2));
    console.log('📊 Number of trip sheets to process:', tripSheets.length);

    for (const tripData of tripSheets) {
      console.log('Processing trip data:', JSON.stringify(tripData, null, 2));
      
      // Handle both old format (direct driver info) and new format (driverInfo object)
      const driverInfo = tripData.driverInfo || tripData;
      const driverName = driverInfo.name || driverInfo.driverName;
      const driverEmpNo = driverInfo.empNo;
      const driverTruckNo = driverInfo.truckNo;
      const driverPhone = driverInfo.phone;
      
      // Find or create driver - prioritize by empNo, then truckNo, then name
      let driver = null;
      
      // Only look for existing driver if we have valid empNo (not "0000")
      if (driverEmpNo && driverEmpNo !== '0000') {
        driver = await Driver.findOne({ empNo: driverEmpNo });
        console.log(`🔍 Looking for driver with empNo: ${driverEmpNo}, found:`, driver ? driver.name : 'None');
      }
      
      if (!driver && driverTruckNo && driverTruckNo !== 'Unknown') {
        driver = await Driver.findOne({ truckNo: driverTruckNo });
        console.log(`🔍 Looking for driver with truckNo: ${driverTruckNo}, found:`, driver ? driver.name : 'None');
      }
      
      if (!driver && driverName && driverName !== '0000' && driverName !== 'Unknown Driver') {
        driver = await Driver.findOne({ name: driverName });
        console.log(`🔍 Looking for driver with name: ${driverName}, found:`, driver ? driver.name : 'None');
      }
      
      if (!driver) {
        // Only create new driver if we have valid data, otherwise skip
        if (driverEmpNo && driverEmpNo !== '0000' && driverName && driverName !== '0000' && driverName !== 'Unknown Driver') {
          // Create new driver with the correct information from PDF
          const uniqueTruckNo = driverTruckNo && driverTruckNo !== 'Unknown' 
            ? driverTruckNo 
            : `TRK${Date.now()}${Math.random().toString(36).substring(2, 5)}`;
          
          const driverData = {
            name: driverName,
            phone: driverPhone || '+1234567890',
            truckNo: uniqueTruckNo,
            empNo: driverEmpNo
          };
          
          console.log('🚛 Creating new driver with data:', driverData);
          driver = new Driver(driverData);
          await driver.save();
          console.log('✅ Created new driver:', driver.name, 'with empNo:', driver.empNo);
        } else {
          // Skip creating driver if data is invalid
          console.log('⚠️ Skipping driver creation - invalid data:', {
            empNo: driverEmpNo,
            name: driverName,
            phone: driverPhone
          });
          console.log('⚠️ Skipping entire trip sheet due to invalid driver data');
          continue; // Skip this trip sheet
        }
      } else {
        // Update existing driver with new information from PDF
        console.log('🔄 Found existing driver:', driver.name, 'Updating with new data...');
        let updated = false;
        
        if (driverName && driverName !== '0000' && driverName !== 'Unknown Driver' && driver.name !== driverName) {
          driver.name = driverName;
          updated = true;
        }
        if (driverPhone && driverPhone !== '0000000000' && driver.phone !== driverPhone) {
          driver.phone = driverPhone;
          updated = true;
        }
        if (driverTruckNo && driverTruckNo !== 'Unknown' && driver.truckNo !== driverTruckNo) {
          driver.truckNo = driverTruckNo;
          updated = true;
        }
        if (driverEmpNo && driverEmpNo !== '0000' && driver.empNo !== driverEmpNo) {
          driver.empNo = driverEmpNo;
          updated = true;
        }
        
        if (updated) {
          await driver.save();
          console.log('✅ Updated driver:', driver.name, 'with empNo:', driver.empNo);
        }
      }

      // Create trip sheet
      const tripSheet = new TripSheet({
        driverId: driver._id,
        date: new Date(),
        startTime: new Date(`2024-01-01 ${driverInfo.startTime || '09:00'}`),
        endTime: new Date(`2024-01-01 ${driverInfo.endTime || '18:00'}`),
        totalDeliveries: tripData.deliveries ? tripData.deliveries.length : 0
      });

      const createdDeliveries = [];

      // Handle both old format (tripData.deliveries) and new format (tripData.deliveries)
      const deliveriesToProcess = tripData.deliveries || tripData.customers || [];
      
      // Group deliveries by invoice number to create one delivery per invoice
      const invoiceGroups = {};
      
      for (const deliveryData of deliveriesToProcess) {
        const invoiceKey = deliveryData.invoiceNo;
        
        if (!invoiceGroups[invoiceKey]) {
          invoiceGroups[invoiceKey] = {
            customerName: deliveryData.customerName,
            phone1: deliveryData.phone1,
            phone2: deliveryData.phone2,
            address: deliveryData.address,
            shift: deliveryData.shift,
            items: [],
            allInvoices: deliveryData.allInvoices || [deliveryData.invoiceNo],
            // Add cluster and concept mapping
            deliverySource: deliveryData.deliverySource,
            cluster: deliveryData.cluster,
            concept: deliveryData.concept
          };
        }
        
        // Add items to the invoice group
        if (deliveryData.items && deliveryData.items.length > 0) {
          invoiceGroups[invoiceKey].items.push(...deliveryData.items);
        }
      }
      
      // Create one delivery per invoice
      for (const [invoiceNo, invoiceData] of Object.entries(invoiceGroups)) {
        // Find or create customer
        let customer = await Customer.findOne({ 
          $or: [
            { phone1: invoiceData.phone1 },
            { name: invoiceData.customerName }
          ]
        });
        
        if (!customer) {
          customer = new Customer({
            name: invoiceData.customerName,
            phone1: invoiceData.phone1,
            phone2: invoiceData.phone2 || '',
            address: invoiceData.address
          });
          await customer.save();
        }

        // Create delivery with all items for this invoice
        const delivery = new Delivery({
          customerId: customer._id,
          driverId: driver._id,
          invoiceNo: invoiceNo,
          items: invoiceData.items,
          status: 'Out for Delivery',
          startTime: tripSheet.startTime,
          endTime: tripSheet.endTime,
          shift: invoiceData.shift || 'Afternoon',
          tripSheetId: tripSheet._id,
          allInvoices: invoiceData.allInvoices,
          // New enhanced fields
          deliverySource: invoiceData.deliverySource || 'Unknown',
          cluster: invoiceData.cluster || 'Unknown',
          concept: invoiceData.concept || 'Unknown',
          driverName: driver.name,
          driverPhone: driver.phone,
          customerName: customer.name,
          customerPhone: customer.phone1,
          address: customer.address,
          remarks: [],
          rtsStatus: 'Not Applicable',
          rtsReason: null,
          rtsDate: null
        });

        await delivery.save();
        createdDeliveries.push(delivery._id);
        
        console.log(`✅ Created delivery for invoice ${invoiceNo} with ${invoiceData.items.length} items`);
      }

      tripSheet.deliveries = createdDeliveries;
      await tripSheet.save();

      // Send WhatsApp notifications to customers (INVOICE-WISE)
      console.log('📱 Sending WhatsApp notifications - one message per invoice');
      const notificationResults = [];
      
      // Send one message per delivery (now grouped by invoice)
      for (const deliveryId of createdDeliveries) {
        try {
          // Get the full delivery with customer and driver details
          const fullDelivery = await Delivery.findById(deliveryId)
            .populate('customerId')
            .populate('driverId');
          
          if (fullDelivery && fullDelivery.customerId && fullDelivery.driverId) {
            // Generate WhatsApp message with item count
            const itemCount = fullDelivery.items ? fullDelivery.items.length : 1;
            const message = generateDeliveryMessage(
              fullDelivery.driverId.name,
              fullDelivery.driverId.phone,
              fullDelivery.invoiceNo,
              fullDelivery.shift || 'Afternoon',
              itemCount
            );
            
            console.log(`📱 Sending message to ${fullDelivery.customerId.name} for invoice ${fullDelivery.invoiceNo}`);
            
            // No messaging functionality - system runs without messaging
            console.log(`📋 Delivery created for ${fullDelivery.customerId.name} (Invoice: ${fullDelivery.invoiceNo})`);
            
            // Log delivery creation
            notificationResults.push({
              customer: fullDelivery.customerId.name,
              phone: fullDelivery.customerId.phone1,
              invoiceNo: fullDelivery.invoiceNo,
              itemCount: itemCount,
              status: 'created',
              messageId: null
            });
            
            // Log secondary phone if available
            if (fullDelivery.customerId.phone2 && 
                fullDelivery.customerId.phone2 !== fullDelivery.customerId.phone1 &&
                fullDelivery.customerId.phone2.length >= 9 && 
                !isNaN(fullDelivery.customerId.phone2)) {
              console.log(`📋 Secondary phone available: ${fullDelivery.customerId.phone2}`);
              
              notificationResults.push({
                customer: fullDelivery.customerId.name,
                phone: fullDelivery.customerId.phone2,
                invoiceNo: fullDelivery.invoiceNo,
                itemCount: itemCount,
                status: 'created',
                messageId: null
              });
            }
          }
        } catch (error) {
          console.error('❌ Error processing delivery:', error);
          notificationResults.push({
            customer: 'Unknown',
            phone: 'Unknown',
            invoiceNo: 'Unknown',
            itemCount: 0,
            status: 'error',
            error: error.message
          });
        }
      }

      processedData.push({
        tripSheetId: tripSheet._id,
        driver: {
          name: driver.name,
          truckNo: driver.truckNo,
          phone: driver.phone
        },
        deliveries: createdDeliveries.length,
        startTime: tripData.startTime,
        endTime: tripData.endTime,
        notifications: notificationResults
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log('📊 Final processed data:', JSON.stringify(processedData, null, 2));
    
    res.json({
      success: true,
      message: 'Trip sheet uploaded and processed successfully',
      data: processedData,
      totalDeliveries: processedData.reduce((sum, item) => sum + item.deliveries, 0)
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: 'Something went wrong'
    });
  }
});

module.exports = router;


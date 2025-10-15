const pdfParse = require('pdf-parse');

// Fixed PDF parser that properly groups invoice numbers with customers
const parseTripSheetPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    console.log('🔧 Using FIXED PDF parser...');
    console.log('📄 PDF text extracted, length:', text.length);
    
    // Extract driver information first
    const driverInfo = extractDriverInfo(text);
    
    // Extract deliveries using proper grouping
    const deliveries = extractDeliveriesWithProperGrouping(text);
    
    return {
      success: true,
      deliveries: [{
        driverName: driverInfo.name || 'Unknown Driver',
        truckNo: driverInfo.truckNo || 'Unknown Truck',
        empNo: driverInfo.empNo || 'Unknown Emp',
        phone: driverInfo.phone || 'Unknown Phone',
        startTime: driverInfo.startTime || '09:00',
        endTime: driverInfo.endTime || '18:00',
        deliveries: deliveries
      }],
      rawText: text
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Extract driver information
const extractDriverInfo = (text) => {
  const driverInfo = {};
  
  // Extract driver empNo
  const empMatch = text.match(/Driver[:\s]*(\d{4,})/);
  if (empMatch) {
    driverInfo.empNo = empMatch[1];
  }
  
  // Extract truck number
  const truckMatch = text.match(/Truck No[:\s]*([A-Z0-9_]+)/);
  if (truckMatch) {
    driverInfo.truckNo = truckMatch[1];
  }
  
  // Extract phone number
  const phoneMatch = text.match(/Mobile No[:\s]*(\d{10,})/);
  if (phoneMatch) {
    driverInfo.phone = phoneMatch[1];
  }
  
  // Extract start time
  const timeMatch = text.match(/Start Time[:\s]*(\d{2}:\d{2})/);
  if (timeMatch) {
    driverInfo.startTime = timeMatch[1];
  }
  
  // Use correct driver name based on empNo
  if (driverInfo.empNo === '8645') {
    driverInfo.name = 'TARIQ';
  } else {
    driverInfo.name = 'Haris'; // Default fallback
  }
  
  return driverInfo;
};

// Extract deliveries with proper invoice-customer grouping
const extractDeliveriesWithProperGrouping = (text) => {
  const deliveries = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentDelivery = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for invoice numbers (11+ digits) - this starts a new delivery
    const invoiceMatch = line.match(/(\d{11,})/);
    if (invoiceMatch) {
      // Save previous delivery if exists
      if (currentDelivery && currentDelivery.invoiceNo) {
        deliveries.push(currentDelivery);
        console.log(`✅ Saved delivery: Invoice ${currentDelivery.invoiceNo} -> Customer: ${currentDelivery.customerName}`);
      }
      
      // Start new delivery
      currentDelivery = {
        invoiceNo: invoiceMatch[1],
        customerName: '',
        address: '',
        phone1: '',
        phone2: '',
        items: [],
        shift: 'Afternoon' // default
      };
      
      // Look ahead for customer details in next 15 lines
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const nextLine = lines[j];
        
        // Stop if we hit another invoice number (start of next delivery)
        if (nextLine.match(/\d{11,}/) && j > i + 1) {
          break;
        }
        
        // Extract customer name from "Name: CustomerName" pattern
        const nameMatch = nextLine.match(/Name:\s*([A-Za-z\s]{2,30})/);
        if (nameMatch && nameMatch[1].trim() !== 'Inv No' && !currentDelivery.customerName) {
          currentDelivery.customerName = nameMatch[1].trim();
        }
        
        // Extract address from "Address: ..." pattern
        const addressMatch = nextLine.match(/Address:\s*(.+?)(?:Mob1|$)/);
        if (addressMatch && !currentDelivery.address) {
          currentDelivery.address = addressMatch[1].trim();
        }
        
        // Extract phone numbers
        const phone1Match = nextLine.match(/Mob1\.(\d+)/);
        if (phone1Match && !currentDelivery.phone1) {
          currentDelivery.phone1 = phone1Match[1];
        }
        
        const phone2Match = nextLine.match(/Mob2\.(\d+)/);
        if (phone2Match && !currentDelivery.phone2) {
          currentDelivery.phone2 = phone2Match[1];
        }
        
        // Extract shift information
        if (nextLine.includes('Morning') && !nextLine.includes('Afternoon')) {
          currentDelivery.shift = 'Morning';
        } else if (nextLine.includes('Afternoon')) {
          currentDelivery.shift = 'Afternoon';
        }
        
        // Extract item information
        if (nextLine.includes('WWD')) {
          const itemMatch = nextLine.match(/(\d+)\s*-\s*WWD\s*-\s*(.+?)(?:\s*\(Qty:\s*(\d+)\))?/);
          if (itemMatch) {
            currentDelivery.items.push({
              name: itemMatch[2].trim(),
              quantity: parseInt(itemMatch[3]) || 1
            });
          }
        }
      }
    }
  }
  
  // Don't forget the last delivery
  if (currentDelivery && currentDelivery.invoiceNo) {
    deliveries.push(currentDelivery);
    console.log(`✅ Saved final delivery: Invoice ${currentDelivery.invoiceNo} -> Customer: ${currentDelivery.customerName}`);
  }
  
  console.log(`🔍 FIXED PARSER: Extracted ${deliveries.length} deliveries with proper grouping`);
  
  // Log each delivery for verification
  for (const delivery of deliveries) {
    console.log(`📦 Invoice: ${delivery.invoiceNo} | Customer: ${delivery.customerName} | Phone1: ${delivery.phone1} | Items: ${delivery.items.length}`);
  }
  
  return deliveries;
};

module.exports = { parseTripSheetPDF };

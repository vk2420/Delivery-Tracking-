const pdf = require('pdf-parse');
const { getClusterAndConcept } = require('./deliverySourceMapping');
const { getDriverName } = require('./driverMapping');

// Extract text from PDF buffer
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// MULTI-DRIVER: Group deliveries by driver and create separate trip sheets
const extractDataWithRegex = (text) => {
  try {
    const driverGroups = new Map(); // driverId -> { driverInfo, deliveries[] }
    let deliverySource = null;
    let cluster = null;
    let concept = null;
    
    console.log('🔍 MULTI-DRIVER APPROACH: Grouping by driver');
    
    // Extract delivery source (LJYW, LJSW, etc.) - try multiple patterns
    console.log('🔍 Searching for delivery source in PDF text...');
    
    // Try different patterns for delivery source
    const sourcePatterns = [
      /Delivery Source:\s*([A-Z0-9]+)/i,
      /Source:\s*([A-Z0-9]+)/i,
      /Store Code:\s*([A-Z0-9]+)/i,
      /Code:\s*([A-Z0-9]+)/i,
      /\b(LJ[A-Z]{2}|MK[A-Z]{2}|LS[A-Z]{2}|HB[A-Z]{2}|TAIF|ALBAHA)\b/i
    ];
    
    for (const pattern of sourcePatterns) {
      const match = text.match(pattern);
      if (match) {
        deliverySource = match[1] || match[0];
        console.log(`📍 Found delivery source: ${deliverySource}`);
        break;
      }
    }
    
    // Map delivery source to cluster and concept
    if (deliverySource) {
      const mapping = getClusterAndConcept(deliverySource);
      cluster = mapping.cluster;
      concept = mapping.concept;
      console.log(`🗺️ Mapped ${deliverySource} → ${cluster} (${concept})`);
    } else {
      console.log('⚠️ No delivery source found in PDF');
      console.log('📄 First 500 characters of PDF text:');
      console.log(text.substring(0, 500));
    }
  
    // Extract ALL driver information - look for multiple drivers by DO numbers
    console.log('🔍 Searching for ALL driver information by DO numbers...');
    console.log('📄 PDF text preview (first 1000 chars):', text.substring(0, 1000));
    console.log('📄 PDF text preview (last 1000 chars):', text.substring(Math.max(0, text.length - 1000)));
    
      // Step 1: Find all DO numbers in the PDF - improved detection
      const doNumbers = [];
      
      // Method 1: Look for "DO No." pattern
      const doMatches = text.match(/DO No[.:\s]*(\d+)/gi);
      if (doMatches) {
        for (const match of doMatches) {
          const doMatch = match.match(/DO No[.:\s]*(\d+)/i);
          if (doMatch && !doNumbers.includes(doMatch[1])) {
            doNumbers.push(doMatch[1]);
            console.log(`📋 Found DO Number: ${doMatch[1]}`);
          }
        }
      }

      // Method 2: Look for distinct 7-digit numbers that could be DO numbers
      if (doNumbers.length === 0) {
        console.log('🔍 Looking for 7-digit DO numbers...');
        const sevenDigitNumbers = text.match(/\b(\d{7})\b/g);
        if (sevenDigitNumbers) {
          for (const number of sevenDigitNumbers) {
            if (!doNumbers.includes(number)) {
              doNumbers.push(number);
              console.log(`📋 Found 7-digit DO Number: ${number}`);
            }
          }
        }
      }

      // Method 3: Look for driver sections by employee numbers
      console.log('🔍 Looking for driver sections by employee numbers...');
      const driverEmpNumbers = ['2306722659', '2587133104', '110717', '8645', '101144'];
      const foundDrivers = [];
      
      for (const empNo of driverEmpNumbers) {
        if (text.includes(empNo)) {
          console.log(`👤 Found driver employee number: ${empNo}`);
          foundDrivers.push(empNo);
          
          // Try to find associated DO number near this employee number
          const empIndex = text.indexOf(empNo);
          const contextBefore = text.substring(Math.max(0, empIndex - 200), empIndex);
          const contextAfter = text.substring(empIndex, Math.min(text.length, empIndex + 200));
          
          // Look for DO number in context
          const doInContext = contextBefore.match(/(\d{7})/) || contextAfter.match(/(\d{7})/);
          if (doInContext && !doNumbers.includes(doInContext[1])) {
            doNumbers.push(doInContext[1]);
            console.log(`📋 Found DO Number near driver ${empNo}: ${doInContext[1]}`);
          }
        }
      }
    
    console.log(`📋 Found ${doNumbers.length} DO numbers:`, doNumbers);
    
      // Step 2: For each DO number, find the associated driver information
      const drivers = [];
      const driverPhones = [];

      for (const doNumber of doNumbers) {
        console.log(`🔍 Looking for driver info for DO: ${doNumber}`);

        // Find the section for this DO number - try multiple approaches
        let doSection = null;
        let section = '';
        
        // Approach 1: Look for DO No. followed by the number
        const doSectionRegex1 = new RegExp(`DO No[.:\s]*${doNumber}[\\s\\S]*?(?=DO No|$)`, 'i');
        doSection = text.match(doSectionRegex1);
        
        if (doSection) {
          section = doSection[0];
          console.log(`📄 DO ${doNumber} section found (approach 1):`, section.substring(0, 500));
        } else {
          // Approach 2: Look for the number in the header area (first 1000 chars)
          const headerSection = text.substring(0, 1000);
          if (headerSection.includes(doNumber)) {
            section = headerSection;
            console.log(`📄 DO ${doNumber} section found (approach 2 - header):`, section.substring(0, 500));
          } else {
            // Approach 3: Look for the number anywhere in the document
            const fullTextIndex = text.indexOf(doNumber);
            if (fullTextIndex !== -1) {
              const contextStart = Math.max(0, fullTextIndex - 500);
              const contextEnd = Math.min(text.length, fullTextIndex + 500);
              section = text.substring(contextStart, contextEnd);
              console.log(`📄 DO ${doNumber} section found (approach 3 - anywhere):`, section.substring(0, 500));
            }
          }
        }
      
      if (section) {
        
        // Look for driver in this section
        let driverFound = false;
        
        // Pattern 1: Driver: followed by employee number
        const driverMatch1 = section.match(/Driver:\s*(\d+)/i);
        if (driverMatch1 && !driverFound) {
          const empNo = driverMatch1[1];
          const mappedName = getDriverName(empNo);
          drivers.push({ empNo, name: mappedName, doNumber });
          console.log(`👤 Found driver for DO ${doNumber}: ${mappedName} (${empNo})`);
          driverFound = true;
        }
        
        // Pattern 2: Look for employee numbers in this section
        if (!driverFound) {
          const empMatches = section.match(/\b(\d{4,10})\b/g);
          if (empMatches) {
            for (const empNo of empMatches) {
              const mappedName = getDriverName(empNo);
              if (mappedName !== empNo && !drivers.some(d => d.empNo === empNo)) {
                drivers.push({ empNo, name: mappedName, doNumber });
                console.log(`👤 Found driver for DO ${doNumber}: ${mappedName} (${empNo})`);
                driverFound = true;
                break;
              }
            }
          }
        }
        
        // Pattern 3: Look for specific employee numbers in the header (like 5663)
          if (!driverFound) {
            const specificEmpNumbers = ['2306722659', '2587133104', '110717', '8645', '101144'];
            for (const empNo of specificEmpNumbers) {
              if (section.includes(empNo)) {
                const mappedName = getDriverName(empNo);
                drivers.push({ empNo, name: mappedName, doNumber });
                console.log(`👤 Found driver for DO ${doNumber} (specific): ${mappedName} (${empNo})`);
                driverFound = true;
                break;
              }
            }
          }
        
        // Look for driver phone in this section
        const phoneMatch = section.match(/Mobile No:\s*(\d+)/i);
        if (phoneMatch) {
          driverPhones.push(phoneMatch[1]);
          console.log(`📱 Found driver phone for DO ${doNumber}: ${phoneMatch[1]}`);
        } else {
          // Try alternative phone patterns
          const altPhoneMatch = section.match(/(\d{10,})/);
          if (altPhoneMatch && altPhoneMatch[1].length >= 10 && altPhoneMatch[1].length <= 15) {
            // Validate it's not an invoice number
            if (!altPhoneMatch[1].startsWith('290742') && !altPhoneMatch[1].startsWith('68229') && !altPhoneMatch[1].startsWith('68230')) {
              driverPhones.push(altPhoneMatch[1]);
              console.log(`📱 Found driver phone (alt) for DO ${doNumber}: ${altPhoneMatch[1]}`);
            } else {
              driverPhones.push('0000000000');
              console.log(`⚠️ Skipping invalid phone (looks like invoice): ${altPhoneMatch[1]}`);
            }
          } else {
            driverPhones.push('0000000000');
          }
        }
        
        if (!driverFound) {
          // Create a default driver for this DO
          drivers.push({ empNo: '0000', name: 'Unknown Driver', doNumber });
          driverPhones.push('0000000000');
          console.log(`⚠️ No driver found for DO ${doNumber}, using default`);
        }
      }
    }
    
    // If no DO numbers found, try the old method
    if (drivers.length === 0) {
      console.log('⚠️ No DO numbers found, trying alternative driver detection...');
      
      // Look for any driver information in the entire PDF
      const driverMatches = text.match(/Driver:\s*(\d+)/gi);
      if (driverMatches) {
        for (const match of driverMatches) {
          const driverMatch = match.match(/Driver:\s*(\d+)/i);
          if (driverMatch) {
            const empNo = driverMatch[1];
            const mappedName = getDriverName(empNo);
            drivers.push({ empNo, name: mappedName, doNumber: 'Unknown' });
            console.log(`👤 Found driver (fallback): ${mappedName} (${empNo})`);
          }
        }
      }
      
      // Look for phone numbers
      const phoneMatches = text.match(/Mobile No:\s*(\d+)/gi);
      if (phoneMatches) {
        for (const match of phoneMatches) {
          const phoneMatch = match.match(/Mobile No:\s*(\d+)/i);
          if (phoneMatch) {
            driverPhones.push(phoneMatch[1]);
            console.log(`📱 Found driver phone (fallback): ${phoneMatch[1]}`);
          }
        }
      }
      
      // Special handling for second driver that appears at the end of PDF
      console.log('🔍 Checking for second driver at end of PDF...');
      const endSection = text.substring(Math.max(0, text.length - 2000)); // Last 2000 chars
      console.log('📄 End section preview:', endSection.substring(0, 500));
      
      // Look for second driver in the end section - only if we haven't found enough drivers
      if (drivers.length < 2) {
        console.log('🔍 Looking for additional drivers in end section...');
        const secondDriverEmpNumbers = ['2587133104', '2306722659'];
        for (const empNo of secondDriverEmpNumbers) {
          if (endSection.includes(empNo) && !drivers.some(d => d.empNo === empNo)) {
            const mappedName = getDriverName(empNo);
            console.log(`👤 Found second driver at end: ${mappedName} (${empNo})`);
            
            // Try to find associated DO number for this driver
            let associatedDoNumber = '0000';
            const doMatch = endSection.match(/(\d{7})/);
            if (doMatch) {
              associatedDoNumber = doMatch[1];
              console.log(`📋 Found DO for second driver: ${associatedDoNumber}`);
            }
            
            drivers.push({ empNo, name: mappedName, doNumber: associatedDoNumber });
            
            // Try to find phone number for second driver - validate it's a real phone number
            const phoneMatch = endSection.match(/(\d{10,})/);
            if (phoneMatch && phoneMatch[1].length >= 10 && phoneMatch[1].length <= 15) {
              // Additional validation: phone numbers shouldn't start with common invoice patterns
              if (!phoneMatch[1].startsWith('290742') && !phoneMatch[1].startsWith('68229') && !phoneMatch[1].startsWith('68230')) {
                driverPhones.push(phoneMatch[1]);
                console.log(`📱 Found phone for second driver: ${phoneMatch[1]}`);
              } else {
                driverPhones.push('0000000000');
                console.log(`⚠️ Skipping invalid phone (looks like invoice): ${phoneMatch[1]}`);
              }
            } else {
              driverPhones.push('0000000000');
            }
          }
        }
      } else {
        console.log('✅ Already found enough drivers, skipping end section search');
      }

      // If still no drivers, don't create default - skip this PDF
      if (drivers.length === 0) {
        console.log(`⚠️ No valid drivers found in PDF - skipping processing`);
        return {
          success: false,
          error: 'No valid drivers found in PDF',
          tripSheets: []
        };
      }
    }
    
    console.log(`🚛 Found ${drivers.length} driver(s):`, drivers.map(d => `${d.name} (${d.empNo}) for DO ${d.doNumber}`));
    
    // Initialize driver groups - consolidate drivers with same employee number
    const processedDrivers = new Set();
    
    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      const actualDriverName = getDriverName(driver.empNo);
      
      // Skip if we've already processed this driver
      if (processedDrivers.has(driver.empNo)) {
        console.log(`🚛 Skipping duplicate driver: ${actualDriverName} (${driver.empNo})`);
        continue;
      }
      
      processedDrivers.add(driver.empNo);
      
      // Use the corresponding phone number if available
      const driverPhone = driverPhones[i] || '0000000000';
      
      // Create a unique driver ID based on employee number only
      const driverId = `${driver.empNo}_${actualDriverName.replace(/\s+/g, '_')}`;
      
      console.log(`🚛 Driver ID: ${driver.empNo} -> Name: ${actualDriverName} -> Phone: ${driverPhone}`);
      
      driverGroups.set(driverId, {
        driverInfo: {
          name: actualDriverName,
          empNo: driver.empNo,
          phone: driverPhone,
          truckNo: 'Unknown',
          startTime: '09:00',
          endTime: '18:00',
          doNumber: driver.doNumber
        },
        deliveries: []
      });
    }
    
    // If we have multiple drivers, we need to distribute deliveries among them
    // For now, we'll assign all deliveries to the first driver, but this can be improved
    // based on your specific business logic
    if (drivers.length > 1) {
      console.log(`🚛 Multiple drivers detected: ${drivers.length}. All deliveries will be assigned to the first driver for now.`);
    }
    
    // Process deliveries and assign to drivers
    const lines = text.split('\n');
    let deliveryCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for invoice numbers (11+ digits)
      const invoiceMatch = line.match(/(\d{11,})/);
      if (invoiceMatch) {
        const invoiceNo = invoiceMatch[1];
        console.log(`📄 Found invoice: ${invoiceNo}`);
        
        // Look for customer data in the next few lines
        let phone1 = '';
        let phone2 = '';
        let customerName = '';
        let address = '';
        let shift = 'Afternoon';
        
        // Search in the next 10 lines for customer data
        for (let j = i + 1; j < Math.min(i + 11, lines.length); j++) {
          const searchLine = lines[j];
          
          // Look for phone numbers
          const phone1Match = searchLine.match(/Mob1\.(\d+)/);
          if (phone1Match && !phone1) {
            phone1 = phone1Match[1];
            console.log(`📱 Found phone1: ${phone1}`);
          }
          
          const phone2Match = searchLine.match(/Mob2\.(\d+)/);
          if (phone2Match && !phone2) {
            phone2 = phone2Match[1];
            console.log(`📱 Found phone2: ${phone2}`);
          }
          
          // Look for customer name - be more specific
          let nameMatch = searchLine.match(/Name:\s*([A-Za-z\s\-\.]{2,50})/);
          if (!nameMatch) {
            // Try to find names that look like actual customer names
            nameMatch = searchLine.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
          }
          if (nameMatch && !customerName &&
              nameMatch[1].trim() !== 'Inv No' &&
              nameMatch[1].trim() !== 'Address' &&
              nameMatch[1].trim() !== 'Customer Details' &&
              nameMatch[1].trim() !== 'DO No' &&
              nameMatch[1].trim() !== 'Driver' &&
              nameMatch[1].trim() !== 'Name' &&
              nameMatch[1].trim().length > 2 &&
              !nameMatch[1].trim().match(/^\d+$/)) { // Don't match pure numbers
            customerName = nameMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
            console.log(`👤 Found customer: ${customerName}`);
          }
          
          // Look for address - try multiple patterns
          let addressMatch = searchLine.match(/(\d+,\s*[A-Za-z\s,]+(?:Jeddah|Makkah|Riyadh|Yanbu|Al Baha|Madina|Taif))/);
          if (!addressMatch) {
            // Try simpler address pattern
            addressMatch = searchLine.match(/([A-Za-z\s,]+(?:Jeddah|Makkah|Riyadh|Yanbu|Al Baha|Madina|Taif))/);
          }
          if (!addressMatch) {
            // Try any text that looks like an address
            addressMatch = searchLine.match(/([A-Za-z\s,]{10,50})/);
          }
          if (addressMatch && !address && addressMatch[1].trim().length > 5) {
            address = addressMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
            console.log(`🏠 Found address: ${address}`);
          }
          
          // Look for shift information
          if (searchLine.includes('Morning') || searchLine.includes('AM')) {
            shift = 'Morning';
          } else if (searchLine.includes('Afternoon') || searchLine.includes('PM')) {
            shift = 'Afternoon';
          }
        }
        
        // Create delivery and assign to driver - ensure we have minimum required data
        if (phone1 || customerName || invoiceNo) {
          // Find the correct driver for this delivery based on DO number
          let assignedDriverId = null;
          let driverGroup = null;
          
          // Try to find which DO section this delivery belongs to
          for (const doNumber of doNumbers) {
            // Look for this invoice in the DO section
            const doSectionRegex = new RegExp(`DO No[.:\s]*${doNumber}[\\s\\S]*?(?=DO No|$)`, 'i');
            const doSection = text.match(doSectionRegex);
            
            if (doSection && doSection[0].includes(invoiceNo)) {
              // This delivery belongs to this DO, find the corresponding driver
              const driver = drivers.find(d => d.doNumber === doNumber);
              if (driver) {
                const driverId = `${driver.empNo}_${getDriverName(driver.empNo).replace(/\s+/g, '_')}`;
                driverGroup = driverGroups.get(driverId);
                assignedDriverId = driverId;
                console.log(`📦 Assigning invoice ${invoiceNo} to driver for DO ${doNumber}`);
                break;
              }
            }
          }
          
          // If no specific DO found, use round-robin assignment
          if (!assignedDriverId) {
            const driverIds = Array.from(driverGroups.keys());
            assignedDriverId = driverIds[deliveryCount % driverIds.length];
            driverGroup = driverGroups.get(assignedDriverId);
            console.log(`📦 Assigning invoice ${invoiceNo} to driver (round-robin): ${assignedDriverId}`);
          }
          
          // Ensure we have valid customer data
          const validCustomerName = customerName && 
            customerName !== 'DO No' && 
            customerName !== 'Driver' && 
            customerName !== 'Name' &&
            customerName.trim().length > 2
            ? customerName.trim() 
            : `Customer_${invoiceNo}`;
          
          const validPhone = phone1 || `0000000000`;
          const validAddress = address && address.length > 5 
            ? address.trim() 
            : 'Address not specified';
          
          const delivery = {
            invoiceNo: invoiceNo,
            customerName: validCustomerName,
            address: validAddress,
            phone1: validPhone,
            phone2: phone2 || '',
            items: [{ name: 'WWD Furniture Item', quantity: 1 }],
            qty: 1,
            shift: shift,
            allInvoices: [invoiceNo],
            deliverySource: deliverySource,
            cluster: cluster,
            concept: concept,
            driverName: driverGroup.driverInfo.name,
            driverPhone: driverGroup.driverInfo.phone,
            customerPhone: validPhone
          };
          
          driverGroup.deliveries.push(delivery);
          deliveryCount++;
          console.log(`🚛 Assigned delivery to driver: ${driverGroup.driverInfo.name}`);
        } else {
          console.log(`⚠️ Skipping invoice ${invoiceNo} - no valid customer data found`);
        }
      }
    }
    
    // Create trip sheets for each driver
    const tripSheets = [];
    
    for (const [driverId, driverGroup] of driverGroups) {
      if (driverGroup.deliveries.length > 0) {
        const tripSheet = {
          driverInfo: driverGroup.driverInfo,
          deliveries: driverGroup.deliveries,
          deliverySource: deliverySource,
          cluster: cluster,
          concept: concept,
          totalDeliveries: driverGroup.deliveries.length
        };
        tripSheets.push(tripSheet);
        console.log(`🚛 Created trip sheet for ${driverGroup.driverInfo.name} with ${driverGroup.deliveries.length} deliveries`);
      }
    }
    
    console.log(`✅ Created ${tripSheets.length} trip sheet(s) with ${tripSheets.reduce((sum, ts) => sum + ts.deliveries.length, 0)} total deliveries`);
    
    return {
      tripSheets,
      deliverySource,
      cluster,
      concept
    };
    
  } catch (error) {
    console.error('❌ Error in extractDataWithRegex:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Return fallback data
    return {
      tripSheets: [{
        driverInfo: { name: 'Unknown Driver', empNo: '0000', phone: '0000000000' },
        deliveries: [],
        deliverySource: 'Unknown',
        cluster: 'Unknown',
        concept: 'Unknown',
        totalDeliveries: 0
      }],
      deliverySource: 'Unknown',
      cluster: 'Unknown',
      concept: 'Unknown'
    };
  }
};

// Main parsing function with multi-driver support
const parseTripSheetWithAI = async (buffer) => {
  try {
    console.log('🤖 Starting multi-driver PDF parsing...');
    
    // Step 1: Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    console.log('📄 PDF text extracted, length:', text.length);
    console.log('📝 Raw text preview:', text.substring(0, 500) + '...');
    
    // Step 2: Use multi-driver regex extraction
    console.log('🔍 Using multi-driver regex extraction...');
    const regexData = extractDataWithRegex(text);
    
    if (regexData.tripSheets.length > 0) {
      console.log('✅ Multi-driver extraction successful!');
      console.log('🚛 Trip sheets found:', regexData.tripSheets.length);
      
      // Convert to the expected format for the upload route
      const allDeliveries = [];
      for (const tripSheet of regexData.tripSheets) {
        for (const delivery of tripSheet.deliveries) {
          allDeliveries.push(delivery);
        }
      }
      
      return {
        success: true,
        tripSheets: regexData.tripSheets,
        deliverySource: regexData.deliverySource,
        cluster: regexData.cluster,
        concept: regexData.concept
      };
    } else {
      console.log('❌ No trip sheets found');
      return {
        success: false,
        error: 'No trip sheets found in PDF',
        deliveries: []
      };
    }
    
  } catch (error) {
    console.error('❌ Error in parseTripSheetWithAI:', error);
    return {
      success: false,
      error: error.message,
      deliveries: []
    };
  }
};

module.exports = {
  parseTripSheetWithAI,
  extractDataWithRegex
};
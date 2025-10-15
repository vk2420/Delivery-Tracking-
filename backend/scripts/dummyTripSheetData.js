const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const TripSheet = require('../models/TripSheet');
const config = require('../config');

const seedDummyTripSheetData = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Driver.deleteMany({});
    await Customer.deleteMany({});
    await Delivery.deleteMany({});
    await TripSheet.deleteMany({});

    console.log('Cleared existing data');

    // Create dummy drivers based on trip sheet format
    const drivers = await Driver.insertMany([
      {
        name: 'Anwar Midex',
        phone: '0546067629',
        truckNo: '436 TJB-9941',
        empNo: '2201279664',
        isActive: true
      },
      {
        name: 'Ahmed Hassan',
        phone: '0555123456',
        truckNo: '437 TJB-9942',
        empNo: '2201279665',
        isActive: true
      },
      {
        name: 'Mohammed Ali',
        phone: '0555234567',
        truckNo: '438 TJB-9943',
        empNo: '2201279666',
        isActive: true
      }
    ]);

    console.log('Created drivers:', drivers.length);

    // Create dummy customers with Makkah addresses (matching trip sheet format)
    const customers = await Customer.insertMany([
      {
        name: 'Agharid Abdel Hamid Maghribi',
        phone1: '541905151',
        phone2: '541905151',
        address: 'Villa No. 7611, Ar Rusayfah, Makkah',
        city: 'Makkah',
        pincode: '24231'
      },
      {
        name: 'Naif Altabeti',
        phone1: '0546464394',
        phone2: '0559350949',
        address: 'Makkah, Al Aziziyah Makkah, Makkah',
        city: 'Makkah',
        pincode: '24232'
      },
      {
        name: 'Rahaf Alshareef',
        phone1: '550183677',
        phone2: '550183677',
        address: '/3123, Batha Quraysh, Makkah',
        city: 'Makkah',
        pincode: '24233'
      },
      {
        name: 'Abeer Alsharief',
        phone1: '563277458',
        phone2: '563277458',
        address: 'Brown And Pink Building, Al Kakiyah, Makkah',
        city: 'Makkah',
        pincode: '24234'
      },
      {
        name: 'Geleena Dawame',
        phone1: '561611857',
        phone2: '561611857',
        address: 'Indian Restaurant Near Car Wash, Mena 3598 3598 Third Ring Road 6216Al Masahir, Al Mashair, Makkah',
        city: 'Makkah',
        pincode: '24235'
      },
      {
        name: 'Sahar Mohammed Al-Batahi',
        phone1: '543119898',
        phone2: '543119898',
        address: 'Ticket Street, Al Awali, Makkah',
        city: 'Makkah',
        pincode: '24236'
      },
      {
        name: 'Fahad Aleteeby',
        phone1: '0567264444',
        phone2: '0550935592',
        address: 'Makkah, Alawali, Al Awali, Makkah',
        city: 'Makkah',
        pincode: '24237'
      },
      {
        name: 'Eman Al Hdhele',
        phone1: '0535493949',
        phone2: '0506338034',
        address: 'Makkah, Al Hasineh, Al Awali, Makkah',
        city: 'Makkah',
        pincode: '24238'
      },
      {
        name: 'Bdor Al Saref',
        phone1: '0555503278',
        phone2: '0555503278',
        address: 'Makkah, Al Awali, Al Awali, Makkah',
        city: 'Makkah',
        pincode: '24239'
      },
      {
        name: 'Hadeel Mohammad Ali',
        phone1: '548844728',
        phone2: '548844728',
        address: '14144, Al Kakiyah, Makkah',
        city: 'Makkah',
        pincode: '24240'
      },
      {
        name: 'Ruba Abdullah Alhumaidy',
        phone1: '569901070',
        phone2: '569901070',
        address: 'New White Building, Fifth Floor, Apartment 13, Al-Russeifa Neighborhood, Ar Rusayfah, Makkah',
        city: 'Makkah',
        pincode: '24241'
      },
      {
        name: 'Flowers Of Maliki',
        phone1: '580912525',
        phone2: '535833325',
        address: 'Floor Number 2, Al Khalidiyah Makkah, Makkah',
        city: 'Makkah',
        pincode: '24242'
      },
      {
        name: 'Mohammad Al Saibi',
        phone1: '596664854',
        phone2: '555097952',
        address: 'Khalidiya After United Pharmacy, Al Khalidiyah Makkah, Makkah',
        city: 'Makkah',
        pincode: '24243'
      },
      {
        name: 'Mareem Mohamaeed',
        phone1: '0555987370',
        phone2: '0501232531',
        address: 'Makkah, Alkaldeeyah 1, Al Khalidiyah Makkah, Makkah',
        city: 'Makkah',
        pincode: '24244'
      }
    ]);

    console.log('Created customers:', customers.length);

    // Create trip sheet for today
    const today = new Date();
    const tripSheet = await TripSheet.create({
      driverId: drivers[0]._id,
      date: today,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 47),
      endTime: null, // Will be set when trip is completed
      totalDeliveries: 14,
      completedDeliveries: 0,
      status: 'Active'
    });

    console.log('Created trip sheet:', tripSheet._id);

    // Create deliveries with WWD furniture items (matching trip sheet format)
    const deliveries = await Delivery.insertMany([
      {
        customerId: customers[0]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68225084807',
        items: [
          {
            name: 'WWD - Misha Daybed with Underbed - 90x200 cm - Chrome/Grey',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 15),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[1]._id,
        driverId: drivers[0]._id,
        invoiceNo: '40088162293320250909',
        items: [
          {
            name: 'WWD - Ollie Small Plastic Tray - Blue',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Bellamy 1 2 6 Dng set-wenge',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 31),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 53),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[2]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226571549',
        items: [
          {
            name: 'WWD - Lynn 8-Seater Dining Set - Brown',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 13),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 38),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[3]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226501143',
        items: [
          {
            name: 'WWD - Finnley Console Table with Mirror - Walnut/Gold',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 48),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 8),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[4]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226577067',
        items: [
          {
            name: 'WWD - Neptune Single Bed - 120x200 cm - Natural Oak',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 22),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 42),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[5]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226372076',
        items: [
          {
            name: 'WWD - Kaiden Marble Top C-Side Table - White/Grey',
            quantity: 4,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 3),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 43),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[6]._id,
        driverId: drivers[0]._id,
        invoiceNo: '40100162173420250909',
        items: [
          {
            name: 'WWD - Vertigo table - Black',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Emma Accent Chair - Grey',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 53),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 13),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[7]._id,
        driverId: drivers[0]._id,
        invoiceNo: '40088162237520250830',
        items: [
          {
            name: 'WWD - Mona 6 Drawer Dresser with Mirror - Waln',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Mona 160 x200 Queen Bed - Beige',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Mona 2 drawer Nightstand - Walnut/Trave',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 10),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[8]._id,
        driverId: drivers[0]._id,
        invoiceNo: '40088162319820250912',
        items: [
          {
            name: 'WWD - Astana Dining Chair - Beige and Gold',
            quantity: 8,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 20),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[9]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68225959604',
        items: [
          {
            name: 'WWD - Clara 3-Seater Velvet Sofa - Beige',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 33),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 43),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[10]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226096677',
        items: [
          {
            name: 'WWD - Harmony Fabric Right Arm Modular Recliner - Grey',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Harmony Fabric Armless Modular Recliner - Grey',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Harmony Fabric Modular Wedge - Grey',
            quantity: 1,
            unit: 'pcs'
          },
          {
            name: 'WWD - Harmony Fabric Left Arm Modular Recliner - Grey',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 54),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 34),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[11]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226216849',
        items: [
          {
            name: 'WWD - Merton 2-Seater Dining Set - Walnut',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 26),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 36),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[12]._id,
        driverId: drivers[0]._id,
        invoiceNo: '68226313295',
        items: [
          {
            name: 'WWD - Leopold 22-Pair Shoe Rack - Oak',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 29),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 59),
        tripSheetId: tripSheet._id
      },
      {
        customerId: customers[13]._id,
        driverId: drivers[0]._id,
        invoiceNo: '40100162171220250908',
        items: [
          {
            name: 'WWD James Elc Single Swivel Recliner - Brown',
            quantity: 1,
            unit: 'pcs'
          }
        ],
        status: 'Out for Delivery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 9),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 19),
        tripSheetId: tripSheet._id
      }
    ]);

    console.log('Created deliveries:', deliveries.length);

    // Update trip sheet with delivery IDs
    await TripSheet.findByIdAndUpdate(tripSheet._id, {
      deliveries: deliveries.map(d => d._id)
    });

    // Create additional drivers and customers for testing
    const additionalCustomers = await Customer.insertMany([
      {
        name: 'Test Customer 1',
        phone1: '0555000001',
        phone2: '0555000002',
        address: 'Test Address 1, Makkah',
        city: 'Makkah',
        pincode: '24250'
      },
      {
        name: 'Test Customer 2',
        phone1: '0555000003',
        address: 'Test Address 2, Makkah',
        city: 'Makkah',
        pincode: '24251'
      }
    ]);

    console.log('Created additional customers:', additionalCustomers.length);

    console.log('✅ Dummy trip sheet data seeded successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${drivers.length} drivers`);
    console.log(`   - ${customers.length + additionalCustomers.length} customers`);
    console.log(`   - ${deliveries.length} deliveries`);
    console.log(`   - 1 active trip sheet`);
    console.log(`🚛 Driver: ${drivers[0].name} (${drivers[0].truckNo})`);
    console.log(`📅 Trip Date: ${today.toDateString()}`);
    console.log(`📍 All deliveries in Makkah area`);

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDummyTripSheetData();

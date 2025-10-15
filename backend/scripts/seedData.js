const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const TripSheet = require('../models/TripSheet');
const config = require('../config');

const seedData = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Driver.deleteMany({});
    await Customer.deleteMany({});
    await Delivery.deleteMany({});
    await TripSheet.deleteMany({});

    // Create sample drivers
    const drivers = await Driver.insertMany([
      {
        name: 'John Smith',
        phone: '+1234567890',
        truckNo: 'TRK001',
        empNo: 'EMP001'
      },
      {
        name: 'Mike Johnson',
        phone: '+1234567891',
        truckNo: 'TRK002',
        empNo: 'EMP002'
      },
      {
        name: 'Sarah Wilson',
        phone: '+1234567892',
        truckNo: 'TRK003',
        empNo: 'EMP003'
      }
    ]);

    console.log('Created drivers:', drivers.length);

    // Create sample customers
    const customers = await Customer.insertMany([
      {
        name: 'ABC Company',
        phone1: '+1987654321',
        phone2: '+1987654322',
        address: '123 Main Street, Downtown',
        city: 'New York',
        pincode: '10001'
      },
      {
        name: 'XYZ Corporation',
        phone1: '+1987654323',
        address: '456 Oak Avenue, Midtown',
        city: 'New York',
        pincode: '10002'
      },
      {
        name: 'Tech Solutions Inc',
        phone1: '+1987654324',
        phone2: '+1987654325',
        address: '789 Pine Street, Uptown',
        city: 'New York',
        pincode: '10003'
      },
      {
        name: 'Global Industries',
        phone1: '+1987654326',
        address: '321 Elm Street, Business District',
        city: 'New York',
        pincode: '10004'
      },
      {
        name: 'Metro Services',
        phone1: '+1987654327',
        phone2: '+1987654328',
        address: '654 Maple Drive, Industrial Zone',
        city: 'New York',
        pincode: '10005'
      }
    ]);

    console.log('Created customers:', customers.length);

    // Create sample trip sheets
    const tripSheets = await TripSheet.insertMany([
      {
        driverId: drivers[0]._id,
        date: new Date(),
        startTime: new Date('2024-01-15T08:00:00Z'),
        endTime: new Date('2024-01-15T17:00:00Z'),
        totalDeliveries: 3,
        completedDeliveries: 2,
        status: 'Active'
      },
      {
        driverId: drivers[1]._id,
        date: new Date(),
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z'),
        totalDeliveries: 2,
        completedDeliveries: 1,
        status: 'Active'
      }
    ]);

    console.log('Created trip sheets:', tripSheets.length);

    // Create sample deliveries
    const deliveries = await Delivery.insertMany([
      // Driver 1 deliveries
      {
        customerId: customers[0]._id,
        driverId: drivers[0]._id,
        invoiceNo: 'INV001',
        items: [
          { name: 'Office Supplies', quantity: 5, unit: 'boxes' },
          { name: 'Electronics', quantity: 2, unit: 'units' }
        ],
        status: 'Delivered',
        deliveredAt: new Date('2024-01-15T10:30:00Z'),
        startTime: new Date('2024-01-15T08:00:00Z'),
        endTime: new Date('2024-01-15T17:00:00Z'),
        tripSheetId: tripSheets[0]._id
      },
      {
        customerId: customers[1]._id,
        driverId: drivers[0]._id,
        invoiceNo: 'INV002',
        items: [
          { name: 'Furniture', quantity: 1, unit: 'set' }
        ],
        status: 'Delivered',
        deliveredAt: new Date('2024-01-15T14:15:00Z'),
        startTime: new Date('2024-01-15T08:00:00Z'),
        endTime: new Date('2024-01-15T17:00:00Z'),
        tripSheetId: tripSheets[0]._id
      },
      {
        customerId: customers[2]._id,
        driverId: drivers[0]._id,
        invoiceNo: 'INV003',
        items: [
          { name: 'Software Licenses', quantity: 10, unit: 'licenses' }
        ],
        status: 'Out for Delivery',
        startTime: new Date('2024-01-15T08:00:00Z'),
        endTime: new Date('2024-01-15T17:00:00Z'),
        tripSheetId: tripSheets[0]._id
      },
      // Driver 2 deliveries
      {
        customerId: customers[3]._id,
        driverId: drivers[1]._id,
        invoiceNo: 'INV004',
        items: [
          { name: 'Industrial Equipment', quantity: 1, unit: 'unit' }
        ],
        status: 'Not Delivered',
        reason: 'Customer not available',
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z'),
        tripSheetId: tripSheets[1]._id
      },
      {
        customerId: customers[4]._id,
        driverId: drivers[1]._id,
        invoiceNo: 'INV005',
        items: [
          { name: 'Packaging Materials', quantity: 20, unit: 'rolls' }
        ],
        status: 'Damage Case',
        reason: 'Package damaged during transit',
        crmNo: 'CRM240115001',
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z'),
        tripSheetId: tripSheets[1]._id
      }
    ]);

    console.log('Created deliveries:', deliveries.length);

    // Update trip sheets with delivery IDs
    await TripSheet.findByIdAndUpdate(tripSheets[0]._id, {
      deliveries: deliveries.slice(0, 3).map(d => d._id)
    });

    await TripSheet.findByIdAndUpdate(tripSheets[1]._id, {
      deliveries: deliveries.slice(3, 5).map(d => d._id)
    });

    console.log('✅ Sample data seeded successfully!');
    console.log(`📊 Created ${drivers.length} drivers, ${customers.length} customers, ${deliveries.length} deliveries`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();

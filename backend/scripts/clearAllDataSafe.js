const mongoose = require('mongoose');
const readline = require('readline');
const config = require('../config');

// Import all models
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const Customer = require('../models/Customer');
const TripSheet = require('../models/TripSheet');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askConfirmation = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const clearAllData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n⚠️  WARNING: This will delete ALL data from your database!');
    console.log('📊 Collections to be cleared:');
    console.log('   - Deliveries');
    console.log('   - Drivers');
    console.log('   - Customers');
    console.log('   - TripSheets');
    
    // Count documents before deletion
    const deliveryCount = await Delivery.countDocuments();
    const driverCount = await Driver.countDocuments();
    const customerCount = await Customer.countDocuments();
    const tripSheetCount = await TripSheet.countDocuments();
    
    console.log('\n📈 Current Data:');
    console.log(`   - Deliveries: ${deliveryCount}`);
    console.log(`   - Drivers: ${driverCount}`);
    console.log(`   - Customers: ${customerCount}`);
    console.log(`   - TripSheets: ${tripSheetCount}`);
    console.log(`   - TOTAL: ${deliveryCount + driverCount + customerCount + tripSheetCount} documents`);

    // Ask for confirmation
    const answer1 = await askConfirmation('\n❓ Are you sure you want to delete ALL data? (yes/no): ');
    
    if (answer1.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled. No data was deleted.');
      rl.close();
      await mongoose.connection.close();
      process.exit(0);
    }

    const answer2 = await askConfirmation('❓ Type "DELETE ALL" to confirm: ');
    
    if (answer2 !== 'DELETE ALL') {
      console.log('\n❌ Confirmation failed. No data was deleted.');
      rl.close();
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\n🗑️  Deleting all data...');
    
    // Delete all documents from each collection
    const deliveryResult = await Delivery.deleteMany({});
    console.log(`✅ Deleted ${deliveryResult.deletedCount} deliveries`);
    
    const driverResult = await Driver.deleteMany({});
    console.log(`✅ Deleted ${driverResult.deletedCount} drivers`);
    
    const customerResult = await Customer.deleteMany({});
    console.log(`✅ Deleted ${customerResult.deletedCount} customers`);
    
    const tripSheetResult = await TripSheet.deleteMany({});
    console.log(`✅ Deleted ${tripSheetResult.deletedCount} trip sheets`);

    console.log('\n✨ Database cleared successfully!');
    console.log('🎉 You can now start fresh with new data.');
    
    rl.close();
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the script
console.log('🚀 Starting database cleanup...\n');
clearAllData();


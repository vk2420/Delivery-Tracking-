#!/bin/bash

echo "🚀 Running dummy trip sheet data script..."
echo "This will clear existing data and create new dummy data matching your trip sheet format"
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    cd "/Users/vishalkhandelwal/Desktop/Real time tracking"
    mongod --dbpath ./data/db &
    sleep 3
fi

# Run the dummy data script
cd "/Users/vishalkhandelwal/Desktop/Real time tracking/backend"
node scripts/dummyTripSheetData.js

echo ""
echo "✅ Dummy data setup complete!"
echo "📊 You can now test your application with realistic trip sheet data"
echo "🌐 Backend API: http://localhost:3001/api"
echo "📱 Frontend: http://localhost:3000"

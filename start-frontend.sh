#!/bin/bash

echo "🎨 Starting Delivery Portal Frontend..."
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start the development server
echo "🔧 Starting React development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Make sure the backend is running on http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start

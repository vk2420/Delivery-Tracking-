#!/bin/bash

echo "🚀 Starting Delivery Portal Backend..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please make sure MongoDB is installed and running."
    echo "   You can use MongoDB Atlas (cloud) or install MongoDB locally."
fi

# Navigate to backend directory
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start the server
echo "🔧 Starting Express server..."
echo "   Backend will be available at: http://localhost:5000"
echo "   API Health Check: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

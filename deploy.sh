#!/bin/bash

echo "🚀 Deploying Delivery Portal to Vercel..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📱 Your driver app will be available at: https://your-app.vercel.app/driver"

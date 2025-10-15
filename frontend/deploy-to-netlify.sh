#!/bin/bash

echo "🚀 Building React app for Netlify deployment..."

# Install dependencies
npm install

# Build the app
npm run build

echo "✅ Build completed! Ready for Netlify deployment."
echo "📁 Build files are in the 'build' directory"
echo "🌐 You can now drag & drop the 'build' folder to Netlify"

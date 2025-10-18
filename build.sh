#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Creating public directory..."
mkdir -p public
cp -r frontend/build/* public/

echo "Build complete!"


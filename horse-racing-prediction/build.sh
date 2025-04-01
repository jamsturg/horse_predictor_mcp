#!/bin/bash

# Build script for Horse Racing Prediction Engine
echo "Building Horse Racing Prediction Engine..."

# Install dependencies
npm install

# Build frontend
cd src/frontend
npm install
npm run build

echo "Build complete!"

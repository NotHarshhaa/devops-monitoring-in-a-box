#!/bin/bash

echo "🎨 Starting DevOps Monitor UI Development Server..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo "🌐 UI will be available at: http://localhost:3000"
echo "📱 The UI will automatically reload when you make changes"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start

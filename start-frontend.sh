#!/bin/bash

echo "🚀 Starting E-commerce Admin Frontend"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the root directory"
    exit 1
fi

# Check if this is the frontend package.json
if ! grep -q "vite" package.json; then
    echo "❌ This doesn't look like the frontend directory"
    echo "💡 Make sure you're in the root directory (not in backend/)"
    exit 1
fi

echo "✅ Found frontend package.json"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Start the development server
echo "🔥 Starting Vite development server..."
npm run dev

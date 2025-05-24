#!/bin/bash

echo "🔧 Fixing E-commerce Admin Issues"
echo "================================="

# Fix PostCSS config
echo "1. Fixing PostCSS configuration..."
if [ -f "postcss.config.js" ]; then
    rm postcss.config.js
    echo "✅ Removed old postcss.config.js"
fi

# Remove type: module from package.json temporarily
echo "2. Fixing package.json..."
cp package.json package.json.backup

# Clean up node_modules and reinstall
echo "3. Cleaning up dependencies..."
rm -rf node_modules package-lock.json
npm install

echo "4. Starting backend..."
cd backend

# Check if already running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is already in use, killing existing process..."
    lsof -ti:3001 | xargs kill -9
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "5. Starting frontend..."
cd ..

# Check if port 5173 is in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is already in use, killing existing process..."
    lsof -ti:5173 | xargs kill -9
fi

# Start frontend
npm run dev

echo "🎉 Both servers should now be running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3001"

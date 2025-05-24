#!/bin/bash

echo "🚀 Starting E-commerce Admin Front & Backend"
echo "==========================================="

export $(grep -v '^#' .env | xargs)

# Ensure we are in the project root by checking for root-level package.json
if [ ! -f "package.json" ]; then
    echo "❌ You must run this script from the root directory!"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "💡 Please set your Neon database URL:"
    echo "   export DATABASE_URL='your_neon_database_url_here'"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Create uploads directory
mkdir -p backend/uploads/products

echo "✅ Environment ready"
echo "🌱 Seeding database..."
cd backend
npm run seed
cd ..

# Start both frontend and backend concurrently
echo "🔥 Starting frontend and backend..."
npm run dev & cd backend && npm run dev

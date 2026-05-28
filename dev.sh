#!/bin/bash

# ============================================
# DEVELOPMENT SERVER STARTER
# ============================================
# This script starts both frontend and backend
# ============================================

echo "🚀 LENDING PENALTY - DEVELOPMENT MODE"
echo "======================================"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

if [ ! -d "worker/node_modules" ]; then
    echo "📦 Installing worker dependencies..."
    cd worker
    npm install
    cd ..
    echo ""
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd worker
npm run dev &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "======================================"
echo "🎉 Development servers running!"
echo "======================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8787"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to press Ctrl+C
wait
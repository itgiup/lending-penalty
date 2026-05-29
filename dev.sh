#!/bin/bash

echo "🚀 Starting Lending Penalty Monorepo..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

echo "📦 Installing dependencies with pnpm..."
pnpm install

echo ""
echo "🏗️  Building shared package..."
cd packages/shared && pnpm build && cd ../..

echo ""
echo "🔧 Starting development servers..."
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8787"
echo ""

# Use turbo to run both dev servers in parallel
pnpm dev

#!/bin/bash

# ============================================
# DATABASE SETUP SCRIPT
# ============================================
# This script helps you set up the D1 database
# ============================================

echo "🗄️  LENDING PENALTY - DATABASE SETUP"
echo "======================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing worker dependencies..."
cd worker
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Create database
echo "🗄️  Step 2: Creating D1 database..."
echo "Running: wrangler d1 create lending_penalty_db"
echo ""

wrangler d1 create lending_penalty_db

echo ""
echo "⚠️  IMPORTANT: Copy the database ID from the output above!"
echo ""
read -p "Press Enter after you've copied the database ID..."

# Step 3: Update wrangler.jsonc
echo ""
echo "📝 Step 3: Please update worker/wrangler.jsonc with your database ID"
echo "   Look for: \"database_id\": \"YOUR_DATABASE_ID_HERE\""
echo "   Replace with your actual database ID"
echo ""
read -p "Have you updated wrangler.jsonc? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please update wrangler.jsonc first, then run this script again"
    exit 1
fi

# Step 4: Run migrations
echo ""
echo "🔄 Step 4: Running database migrations..."
npm run db:migrate

echo ""
echo "✅ Database migrations complete!"
echo ""

# Step 5: Verify
echo "🔍 Step 5: Verifying database setup..."
wrangler d1 execute lending_penalty_db --command=".tables"

echo ""
echo "======================================"
echo "🎉 DATABASE SETUP COMPLETE!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start dev server: cd worker && npm run dev"
echo "2. Test API: curl http://localhost:8787/health"
echo "3. See DATABASE_SETUP.md for more details"
echo ""
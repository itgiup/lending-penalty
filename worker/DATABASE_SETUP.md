# 🗄️ Database Setup Guide - Cloudflare D1

## 📋 Overview

Project sử dụng **Cloudflare D1** (SQLite) để lưu trữ:
- User accounts & authentication
- Loans data
- Payments history

---

## 🚀 Quick Start

### 1. Install Worker Dependencies

```bash
cd worker
npm install
```

### 2. Create D1 Database

```bash
# Create new D1 database
wrangler d1 create lending_penalty_db
```

Output sẽ có dạng:
```
✅ Successfully created DB 'lending_penalty_db' in region WEUR
id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Update wrangler.jsonc

Copy `database_id` từ output trên và paste vào `worker/wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "lending_penalty_db",
      "database_id": "YOUR_DATABASE_ID_HERE"  // ← Paste ID vào đây
    }
  ]
}
```

### 4. Run Database Migrations

```bash
# Option 1: Using npm script
npm run db:migrate

# Option 2: Manual command
wrangler d1 execute lending_penalty_db --file=schema.sql
```

### 5. Verify Tables Created

```bash
# Open D1 shell
npm run db:shell

# Or manual
wrangler d1 shell lending_penalty_db

# Check tables
.tables

# Should see: loans, payments, users

# Exit
.exit
```

---

## 📊 Database Schema

### **users** table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  phone TEXT,
  google_id TEXT UNIQUE,
  facebook_id TEXT UNIQUE,
  passkey_credentials TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Fields:**
- `id`: Unique identifier (auto-generated)
- `email`: User email (unique, required)
- `password_hash`: Hashed password
- `name`: User's full name (optional)
- `phone`: Phone number (optional)
- `google_id`: Google OAuth ID (for social login)
- `facebook_id`: Facebook OAuth ID (for social login)
- `passkey_credentials`: JSON string for passkey auth
- `created_at/updated_at`: Timestamps

---

### **loans** table
```sql
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  borrower_name TEXT NOT NULL,
  borrower_phone TEXT,
  borrower_address TEXT,
  principal INTEGER NOT NULL,
  interest_rate REAL NOT NULL,
  penalty_rate REAL NOT NULL,
  start_date TEXT NOT NULL,
  term_months INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique loan identifier
- `user_id`: Owner of the loan (FK to users)
- `borrower_name`: Name of borrower (required)
- `borrower_phone`: Borrower's phone (optional)
- `borrower_address`: Borrower's address (optional)
- `principal`: Loan amount in VND
- `interest_rate`: Annual interest rate (%)
- `penalty_rate`: Annual penalty rate (%)
- `start_date`: Loan start date (ISO format)
- `term_months`: Loan term in months
- `status`: 'active', 'paid', or 'overdue'
- `notes`: Additional notes (optional)

---

### **payments** table
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique payment identifier
- `loan_id`: Associated loan (FK to loans)
- `amount`: Payment amount in VND
- `payment_date`: Date of payment (ISO format)
- `notes`: Payment notes (optional)

---

## 🔍 Useful Commands

### View Database Info
```bash
wrangler d1 info lending_penalty_db
```

### Execute SQL Query
```bash
wrangler d1 execute lending_penalty_db --command="SELECT * FROM users LIMIT 5;"
```

### Export Database
```bash
wrangler d1 export lending_penalty_db --output=./backup.sql
```

### Import Database
```bash
wrangler d1 execute lending_penalty_db --file=./backup.sql
```

### Reset Database (Development)
```bash
# Delete all data
wrangler d1 execute lending_penalty_db --command="DELETE FROM payments; DELETE FROM loans; DELETE FROM users;"

# Or drop and recreate tables
wrangler d1 execute lending_penalty_db --file=schema.sql
```

---

## 🧪 Testing API Endpoints

### 1. Start Local Dev Server
```bash
cd worker
npm run dev
```

Server chạy tại: `http://localhost:8787`

### 2. Test Health Check
```bash
curl http://localhost:8787/health
```

### 3. Test User Registration
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "0123456789"
  }'
```

### 4. Test Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 5. Test Create Loan
```bash
curl -X POST http://localhost:8787/api/loans \
  -H "Content-Type: application/json" \
  -d '{
    "borrower_name": "Nguyễn Văn A",
    "borrower_phone": "0123456789",
    "principal": 1000000,
    "interest_rate": 20,
    "penalty_rate": 40,
    "start_date": "2022-01-01",
    "term_months": 12
  }'
```

### 6. Test Record Payment
```bash
curl -X POST http://localhost:8787/api/loans/LOAN_ID/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "payment_date": "2026-05-28",
    "notes": "First payment"
  }'
```

---

## 📈 Indexes

Database đã tạo indexes cho performance:

```sql
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_facebook_id ON users(facebook_id);
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: Current implementation uses plaintext passwords for development!

**Before Production:**
1. Implement proper password hashing with bcrypt
2. Add JWT token authentication
3. Add CORS restrictions
4. Add rate limiting
5. Add input sanitization
6. Enable HTTPS only

---

## 🚨 Troubleshooting

### Issue: "Database not found"
```bash
# Solution: Make sure database_id in wrangler.toml is correct
wrangler d1 list
```

### Issue: "Table doesn't exist"
```bash
# Solution: Run migrations again
wrangler d1 execute lending_penalty_db --file=schema.sql
```

### Issue: "Foreign key constraint failed"
```bash
# Solution: Check that referenced records exist
# Example: user_id must exist in users table before creating loan
```

---

## 📚 Next Steps

Sau khi setup database xong:

1. ✅ Test all API endpoints
2. 🔄 Implement frontend integration
3. 🔐 Add JWT authentication
4. 🎨 Build React components for loan management
5. 🚀 Deploy to Cloudflare Workers

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-28
# 🚀 Debt Management System - Quick Start

## 📖 Overview

Hệ thống quản lý nợ hoàn chỉnh với authentication, database và tính toán lãi/phạt động.

**Tính năng chính:**
- ✅ User authentication (email/password)
- ✅ Cloudflare D1 database
- ✅ Loan management (CRUD)
- ✅ Payment tracking
- ✅ Real-time calculations
- ✅ Multi-language (VI/EN/ZH/RU)
- ✅ Dark/Light theme

---

## 🎯 Architecture

```
Frontend (React 19 + Vite)
    ↓ HTTPS/API
Backend (Cloudflare Workers + Hono)
    ↓ SQL
Database (Cloudflare D1)
```

---

## 🚀 Quick Start

### **Option 1: Automated Setup (Recommended)**

```bash
# Make script executable
chmod +x dev.sh

# Start both frontend and backend
./dev.sh
```

This will:
1. Install all dependencies
2. Start backend on `http://localhost:8787`
3. Start frontend on `http://localhost:5173`

---

### **Option 2: Manual Setup**

#### **Step 1: Setup Database**

```bash
cd worker

# Install dependencies
npm install

# Create D1 database
wrangler d1 create lending_penalty_db

# Copy the database_id from output
# Update wrangler.jsonc with your database_id

# Run migrations
npm run db:migrate
```

#### **Step 2: Start Backend**

```bash
# In worker directory
npm run dev
# Backend runs at http://localhost:8787
```

#### **Step 3: Start Frontend**

```bash
# In root directory
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🧪 Testing

### **1. Test Registration**

Open browser: `http://localhost:5173/register`

Fill form:
- Name: Test User
- Email: test@example.com
- Phone: 0123456789
- Password: password123
- Confirm: password123

Click "Đăng Ký" → Should redirect to dashboard

---

### **2. Test Login**

Open browser: `http://localhost:5173/login`

Enter:
- Email: test@example.com
- Password: password123

Click "Đăng Nhập" → Should redirect to dashboard

---

### **3. Test Public Calculator**

Open browser: `http://localhost:5173/`

Use calculator without logging in → Works perfectly!

---

### **4. Test API Directly**

```bash
# Health check
curl http://localhost:8787/health

# Register user
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'

# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

---

## 📁 Project Structure

```
lending-penalty/
│
├── src/                          # Frontend React
│   ├── api/                      # API clients
│   │   └── client.js            # Axios instances
│   ├── components/               # UI Components
│   │   ├── LoanCalculator.jsx   # Public calculator
│   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   └── ResultsDisplay.jsx   # Calculation results
│   ├── context/                  # React Context
│   │   ├── AuthContext.jsx      # Authentication
│   │   └── ThemeContext.jsx     # Theme management
│   ├── pages/                    # Page components
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   └── Dashboard.jsx        # Dashboard (protected)
│   ├── utils/
│   │   └── calculations.js      # Calculation logic
│   └── App.jsx                   # Main app with routing
│
├── worker/                       # Backend API
│   ├── src/
│   │   └── index.ts             # Hono API routes
│   ├── schema.sql               # Database schema
│   ├── wrangler.jsonc           # Cloudflare config
│   └── package.json
│
├── .env.local                    # Environment variables
├── dev.sh                        # Dev server starter
├── setup-database.sh            # Database setup script
└── package.json
```

---

## 🔐 Authentication Flow

```
User visits site
    ↓
Sees public calculator (/)
    ↓
Clicks "Đăng Nhập" → /login
    ↓
Enters credentials
    ↓
API validates → Returns user data
    ↓
Frontend stores in localStorage
    ↓
Redirects to /dashboard
    ↓
Dashboard shows user info
```

**Session Persistence:**
- User data stored in localStorage
- Auto-login on page refresh
- Logout clears session

---

## 🗄️ Database Schema

### **users**
- id, email, password_hash, name, phone
- google_id, facebook_id (for OAuth - future)
- created_at, updated_at

### **loans**
- id, user_id, borrower_name, borrower_phone
- principal, interest_rate, penalty_rate
- start_date, term_months, status
- created_at, updated_at

### **payments**
- id, loan_id, amount, payment_date, notes
- created_at

---

## 🌍 Multi-Language Support

Supported languages:
- 🇻🇳 Tiếng Việt (default)
- 🇬🇧 English
- 🇨🇳 中文
- 🇷🇺 Русский

Switch language via dropdown in header.

---

## 🎨 Theme System

- ☀️ Light mode (default)
- 🌙 Dark mode
- Toggle via switch in header
- Preference saved to localStorage

---

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (protected)

### **Loans**
- `GET /api/loans` - List all loans (protected)
- `POST /api/loans` - Create loan (protected)
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan
- `POST /api/loans/calculate` - Calculate status (public)

### **Payments**
- `GET /api/loans/:id/payments` - List payments
- `POST /api/loans/:id/payments` - Record payment
- `DELETE /api/payments/:id` - Delete payment

---

## 🛠️ Available Scripts

### **Frontend**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Backend**
```bash
cd worker
npm run dev          # Start local dev server
npm run deploy       # Deploy to Cloudflare
npm run db:migrate   # Run database migrations
npm run db:shell     # Open D1 shell
```

### **Both**
```bash
./dev.sh             # Start both servers
./setup-database.sh  # Setup database
```

---

## 🚨 Troubleshooting

### **Issue: Backend not starting**
```bash
# Check if port 8787 is in use
lsof -i :8787

# Kill process if needed
kill -9 <PID>

# Restart
cd worker && npm run dev
```

### **Issue: Database errors**
```bash
# Recreate database
wrangler d1 delete lending_penalty_db
wrangler d1 create lending_penalty_db

# Update wrangler.jsonc with new ID
# Run migrations
npm run db:migrate
```

### **Issue: Frontend can't connect to backend**
```bash
# Check .env.local
cat .env.local

# Should have:
# VITE_API_URL=http://localhost:8787

# Restart frontend after changing .env
```

---

## 📈 Progress

```
✅ Phase 1: Backend & Database
✅ Phase 2: Frontend Authentication
⏳ Phase 3: Loan Management (Next)
⏳ Phase 4: Advanced Features (Future)
```

---

## 🔮 Future Features

- [ ] Google OAuth login
- [ ] Facebook OAuth login
- [ ] Passkey/WebAuthn support
- [ ] JWT token authentication
- [ ] Email verification
- [ ] Password reset
- [ ] Loan CRUD UI
- [ ] Payment recording UI
- [ ] Charts & analytics
- [ ] Export reports (PDF)
- [ ] Notifications

---

## 📞 Support

- **Documentation**: See PHASE_1_COMPLETE.md, PHASE_2_COMPLETE.md
- **Database Guide**: worker/DATABASE_SETUP.md
- **Migration Guide**: MIGRATION_GUIDE.md

---

## 📝 License

MIT License - Version 2.0.0-beta

---

**Happy coding! 🎉**
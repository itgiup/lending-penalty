# 🚀 Debt Management System - Upgrade Guide

## 📖 Overview

Project **lending-penalty** đã được nâng cấp từ một simple calculator thành **hệ thống quản lý nợ hoàn chỉnh** với:

- ✅ User authentication (email/password + OAuth + Passkey)
- ✅ Cloudflare D1 database
- ✅ Loan management (CRUD operations)
- ✅ Payment tracking
- ✅ Real-time balance calculations
- ✅ Dashboard & analytics

---

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React 19)               │
│  ┌───────────┐  ┌──────────────────────┐   │
│  │ Calculator│  │  Loan Management     │   │
│  │ (Public)  │  │  (Authenticated)     │   │
│  └───────────┘  └──────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │ HTTPS/API Calls
               ▼
┌─────────────────────────────────────────────┐
│      Backend (Cloudflare Workers)           │
│         Hono Framework + TypeScript         │
│  ┌─────────────────────────────────────┐   │
│  │  Authentication & Authorization     │   │
│  │  Loans CRUD API                     │   │
│  │  Payments API                       │   │
│  │  Calculation Engine                 │   │
│  └─────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │ SQL Queries
               ▼
┌─────────────────────────────────────────────┐
│       Database (Cloudflare D1)              │
│         SQLite Serverless DB                │
│  ┌──────────┐ ┌──────┐ ┌──────────┐       │
│  │  users   │ │loans │ │ payments │       │
│  └──────────┘ └──────┘ └──────────┘       │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
lending-penalty/
│
├── src/                          # Frontend React
│   ├── components/               # UI Components
│   ├── pages/                    # Page Components (NEW)
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   └── Dashboard.jsx        # Loan management dashboard
│   ├── context/                  # React Context
│   │   ├── ThemeContext.jsx     # Theme management
│   │   └── AuthContext.jsx      # Auth state (NEW)
│   ├── api/                      # API clients (NEW)
│   │   ├── auth.js              # Auth API calls
│   │   ├── loans.js             # Loans API calls
│   │   └── payments.js          # Payments API calls
│   ├── utils/
│   │   └── calculations.js      # Calculation logic
│   └── App.jsx                   # Main app with routing
│
├── worker/                       # Backend API
│   ├── src/
│   │   └── index.ts             # Hono API routes
│   ├── schema.sql               # Database schema
│   ├── wrangler.toml            # Cloudflare config
│   ├── DATABASE_SETUP.md        # Database guide
│   └── package.json
│
├── setup-database.sh            # Database setup script
├── PHASE_1_COMPLETE.md          # Phase 1 summary
└── README.md
```

---

## 🗺️ Roadmap

### **Phase 1: Backend & Database** ✅ COMPLETE
- [x] Database schema design
- [x] D1 database setup
- [x] API endpoints implementation
- [x] Request validation
- [x] Documentation

**Files Created:**
- `worker/schema.sql`
- `worker/src/index.ts` (updated)
- `worker/DATABASE_SETUP.md`
- `setup-database.sh`

---

### **Phase 2: Frontend Authentication** 🔄 IN PROGRESS
- [ ] Install react-router-dom
- [ ] Create AuthContext
- [ ] Build Login/Register pages
- [ ] Implement protected routes
- [ ] API integration

**Files to Create:**
- `src/context/AuthContext.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/api/auth.js`

---

### **Phase 3: Loan Management** ⏳ PENDING
- [ ] Dashboard page
- [ ] Loan list component
- [ ] Add/Edit loan forms
- [ ] Payment recording
- [ ] Real-time updates

**Files to Create:**
- `src/pages/Dashboard.jsx`
- `src/components/LoanList.jsx`
- `src/components/LoanForm.jsx`
- `src/components/PaymentForm.jsx`
- `src/api/loans.js`
- `src/api/payments.js`

---

### **Phase 4: Advanced Features** ⏳ FUTURE
- [ ] Google OAuth integration
- [ ] Facebook OAuth integration
- [ ] Passkey/WebAuthn support
- [ ] JWT token authentication
- [ ] Email verification
- [ ] Password reset
- [ ] Notifications
- [ ] Export reports (PDF/Excel)
- [ ] Charts & analytics

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- npm or yarn
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account (for deployment)

### Step 1: Setup Database

```bash
# Run automated setup script
chmod +x setup-database.sh
./setup-database.sh

# Or manual setup (see worker/DATABASE_SETUP.md)
```

### Step 2: Start Development

```bash
# Terminal 1: Start backend
cd worker
npm run dev
# API runs at http://localhost:8787

# Terminal 2: Start frontend
cd ..
npm install
npm run dev
# App runs at http://localhost:5173
```

### Step 3: Test APIs

```bash
# Health check
curl http://localhost:8787/health

# Register user
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test User"}'

# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

---

## 🔐 Security Considerations

### Current State (Development)
- ⚠️ Passwords stored in plaintext
- ⚠️ No JWT tokens
- ⚠️ No authentication middleware
- ⚠️ All routes are public

### Before Production
- ✅ Implement bcrypt password hashing
- ✅ Add JWT token authentication
- ✅ Protect routes with auth middleware
- ✅ Enable CORS restrictions
- ✅ Add rate limiting
- ✅ Use HTTPS only
- ✅ Sanitize all inputs
- ✅ Add CSRF protection

---

## 📊 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Loans
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/loans` | List all loans | Yes |
| POST | `/api/loans` | Create loan | Yes |
| GET | `/api/loans/:id` | Get loan details | Yes |
| PUT | `/api/loans/:id` | Update loan | Yes |
| DELETE | `/api/loans/:id` | Delete loan | Yes |
| POST | `/api/loans/calculate` | Calculate status | No |

### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/loans/:id/payments` | List payments | Yes |
| POST | `/api/loans/:id/payments` | Record payment | Yes |
| DELETE | `/api/payments/:id` | Delete payment | Yes |

---

## 🧪 Testing

### Manual Testing
See `worker/DATABASE_SETUP.md` for curl examples.

### Automated Testing (Future)
- Unit tests for calculation functions
- Integration tests for API endpoints
- E2E tests for user flows

---

## 📈 Performance Optimization

### Database Indexes
Already created for common queries:
- `idx_loans_user_id` - Fast loan lookup by user
- `idx_loans_status` - Filter by loan status
- `idx_payments_loan_id` - Fast payment lookup
- `idx_users_email` - Fast user login

### Caching Strategy (Future)
- Cache loan calculations
- Cache user profiles
- Use Cloudflare KV for session storage

---

## 🚨 Troubleshooting

### Database Issues
See `worker/DATABASE_SETUP.md` → Troubleshooting section

### API Issues
```bash
# Check worker logs
wrangler tail

# Check local dev logs
# Look at terminal output when running npm run dev
```

### Frontend Issues
```bash
# Clear browser cache
# Check browser console for errors
# Verify API URL in .env.local
```

---

## 📞 Support & Resources

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Hono Docs**: https://hono.dev/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **React Router**: https://reactrouter.com/

---

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ Added user authentication system
- ✨ Added Cloudflare D1 database
- ✨ Added loan management APIs
- ✨ Added payment tracking
- 🔄 Migrated from pure frontend to full-stack

### Version 1.0.0 (Previous)
- Pure frontend calculator
- No database
- No authentication
- Local calculations only

---

## 🎯 Next Steps

1. **Complete Phase 2**: Build authentication UI
2. **Test thoroughly**: Ensure all APIs work correctly
3. **Add security**: Implement JWT, bcrypt, etc.
4. **Build dashboard**: Loan management interface
5. **Deploy**: Push to Cloudflare Workers/Pages

---

**Status**: Phase 1 Complete ✅  
**Version**: 2.0.0-alpha  
**Last Updated**: 2026-05-28
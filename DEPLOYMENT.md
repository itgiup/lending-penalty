# 📚 Hướng Dẫn Triển Khai (Deployment Guide)

## 🎯 Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Browser/Client                       │
│            (React + Ant Design + Framer Motion)         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Hono)                  │
│                   API Backend                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Cloudflare D1 Database (SQLite)                 │
│              Persistence Layer                          │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Bước 1: Chuẩn Bị Frontend

### 1.1 Build Production
```bash
cd /home/u/Documents/lending-penalty
npm install
npm run build
```

Kết quả sẽ nằm trong thư mục `dist/`

### 1.2 Triển Khai Frontend (Cloudflare Pages)

```bash
# Install Wrangler CLI
npm install -g @cloudflare/wrangler

# Authenticate
wrangler auth

# Deploy frontend tới Cloudflare Pages
wrangler pages deploy dist --project-name lending-penalty
```

**Hoặc**: 
- Đẩy code lên GitHub
- Connect GitHub repo tới Cloudflare Pages
- Tự động build và deploy

## 🚀 Bước 2: Triển Khai Backend (Cloudflare Workers)

### 2.1 Chuẩn Bị Worker

```bash
cd worker
npm install
```

### 2.2 Cấu Hình wrangler.toml

Cập nhật `worker/wrangler.toml`:

```toml
name = "lending-penalty-worker"
main = "src/index.ts"
compatibility_date = "2024-01-15"

# Production environment
[env.production]
name = "lending-penalty-worker-prod"
route = "https://api.yourdomain.com/api/*"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "lending_penalty_db"
database_id = "YOUR_DATABASE_ID"
```

### 2.3 Tạo D1 Database

```bash
# Tạo database mới
wrangler d1 create lending_penalty_db

# Copy database_id vào wrangler.toml
```

### 2.4 Deploy Worker

```bash
wrangler deploy
```

Kết quả: API endpoint ở `https://lending-penalty-worker.YOUR_ACCOUNT.workers.dev`

### 2.5 Tạo Database Tables

```bash
# Connect tới database
wrangler d1 shell lending_penalty_db

# Chạy SQL:
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  principal INTEGER NOT NULL,
  interest_rate REAL NOT NULL,
  penalty_rate REAL NOT NULL,
  start_date TEXT NOT NULL,
  term_months INTEGER NOT NULL,
  customer_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);
```

## 🎯 Bước 3: Kết Nối Frontend & Backend

### 3.1 Cập Nhật Environment Variables

Frontend - `.env.production`:
```
VITE_API_URL=https://lending-penalty-worker.YOUR_ACCOUNT.workers.dev
VITE_APP_NAME="Máy Tính Lãi/Phạt Cho Vay"
```

### 3.2 Update API Calls

Cập nhật `src/components/LoanCalculator.jsx`:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;

const onFinish = async (values) => {
  try {
    const response = await fetch(`${apiUrl}/api/loans/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loan)
    });
    const result = await response.json();
    setLoanData(result);
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

## ✅ Bước 4: Testing

### Local Testing

```bash
# Terminal 1: Frontend dev server
npm run dev

# Terminal 2: Backend dev server
cd worker && npm run dev
```

Test endpoints:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

### Production Testing

1. Test API health:
```bash
curl https://lending-penalty-worker.YOUR_ACCOUNT.workers.dev/health
```

2. Test calculation:
```bash
curl -X POST https://lending-penalty-worker.YOUR_ACCOUNT.workers.dev/api/loans/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 1000000,
    "interestRate": 20,
    "penaltyRate": 40,
    "startDate": "2022-01-01",
    "termMonths": 12
  }'
```

## 🔗 Custom Domain Setup

### Option 1: Cloudflare Domain
- Frontend: `https://lending-penalty.yourcompany.com` (Pages)
- Backend: `https://api.yourcompany.com` (Workers)

### Option 2: Setup Routing
```toml
# wrangler.toml
route = "https://yourcompany.com/api/*"
```

## 📊 Monitoring & Logs

### View Worker Logs
```bash
wrangler tail
```

### View D1 Queries
```bash
wrangler d1 insight-data lending_penalty_db
```

### Cloudflare Dashboard
- Analytics & Metrics: https://dash.cloudflare.com
- Monitor API usage, errors, performance

## 🛡️ Security Checklist

- [ ] Enable CORS chỉ cho frontend domain
- [ ] Add API rate limiting
- [ ] Validate input data
- [ ] Use HTTPS everywhere
- [ ] Secure API keys/tokens (if needed)
- [ ] Monitor suspicious activities

## 🚨 Troubleshooting

### 1. CORS Errors
```javascript
// Add CORS headers trong wrangler.toml
env = { CORS_ORIGIN = "https://yourfrontend.com" }
```

### 2. Database Connection Issues
```bash
# Test database connection
wrangler d1 execute lending_penalty_db "SELECT 1"
```

### 3. API Timeout
- Check worker CPU usage
- Optimize calculations
- Add caching layer

## 📈 Performance Optimization

### 1. Enable Caching
```javascript
// In worker routes
c.header('Cache-Control', 'max-age=3600');
```

### 2. Database Indexing
```sql
CREATE INDEX idx_loan_customer ON loans(customer_id);
CREATE INDEX idx_payment_loan ON payments(loan_id);
```

### 3. Pagination for Large Results
```javascript
// Implement pagination in API
const limit = 50;
const offset = (page - 1) * limit;
```

## 💰 Cost Estimation (Cloudflare Free Plan)

- **Cloudflare Workers**: 100,000 requests/day (free)
- **D1 Database**: Free tier included
- **Pages**: Unlimited deployments
- **Total**: ~$0/month (if within free limits)

Paid limits:
- Workers: $0.50 per million requests
- D1: $0.75 per million read units, $1.50 per million write units

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: nodejs/setup-node@v2
        with:
          node-version: '18'
      
      # Deploy Frontend
      - name: Deploy Frontend
        run: npm run build && wrangler pages deploy dist
      
      # Deploy Backend
      - name: Deploy Worker
        run: cd worker && wrangler deploy
```

## 📞 Support & Contacts

- Cloudflare Docs: https://developers.cloudflare.com
- Hono Docs: https://hono.dev
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-28

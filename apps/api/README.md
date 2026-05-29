# 🚀 Hono Backend - Lending Penalty Calculator

Backend API xây dựng trên Hono + Cloudflare Workers + D1 Database.

## 🛠️ Công Nghệ

- **Framework**: Hono (lightweight HTTP framework)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript

## 📋 Yêu Cầu

- Node.js >= 16
- Tài khoản Cloudflare Workers

## 🚀 Cài Đặt

### Setup Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server sẽ chạy tại `http://localhost:8787`

### Deploy to Cloudflare

```bash
# Cấu hình Cloudflare credentials
wrangler auth

# Deploy
npm run deploy
```

## 📚 API Endpoints

### 1. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

### 2. Tính Toán Khoản Vay
```
POST /api/loans/calculate
Content-Type: application/json
```

**Request Body:**
```json
{
  "principal": 1000000,
  "interestRate": 20,
  "penaltyRate": 40,
  "startDate": "2022-01-01",
  "termMonths": 12,
  "paidAmount": 0
}
```

**Response:**
```json
{
  "principal": 1000000,
  "interest": 2288000,
  "penalty": 9000000,
  "totalDebt": 12288000,
  "paidAmount": 0,
  "remainingDebt": 12288000,
  "dueDate": "2023-01-01",
  "currentDate": "2026-05-28",
  "isOverdue": true,
  "periodsElapsed": 4.33,
  "penaltyLoans": [
    {
      "period": 1,
      "base": 1200000,
      "penalty": 480000,
      "total": 1680000
    }
    // ... more periods
  ],
  "details": {
    "interestRate": 0.2,
    "penaltyRate": 0.4,
    "termMonths": 12,
    "startDate": "2022-01-01"
  }
}
```

### 3. Tạo Khoản Vay Mới
```
POST /api/loans
Content-Type: application/json
```

**Request Body:**
```json
{
  "principal": 1000000,
  "interestRate": 20,
  "penaltyRate": 40,
  "startDate": "2022-01-01",
  "termMonths": 12,
  "customerId": "customer123"
}
```

**Response:**
```json
{
  "id": "abc123def",
  "principal": 1000000,
  "createdAt": "2026-05-28T00:00:00.000Z"
  // ... other fields
}
```

### 4. Lấy Chi Tiết Khoản Vay
```
GET /api/loans/:id
```

### 5. Ghi Nhận Thanh Toán
```
POST /api/loans/:id/payment
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 500000,
  "paymentDate": "2026-05-28"
}
```

## 🗄️ Database Schema (D1)

### Table: loans
```sql
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
```

### Table: payments
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);
```

## 🔒 CORS Policy

API hỗ trợ CORS cho các requests từ frontend:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 🛡️ Error Handling

Tất cả errors được trả về với format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 📝 Development Notes

### Cấu Trúc Code

```
worker/
├── src/
│   └── index.ts          # Main Hono app & routes
├── wrangler.toml         # Cloudflare Worker config
└── package.json          # Dependencies
```

### Running Tests

```bash
# (Future) Run tests
npm run test
```

## 🌐 Environment Variables

Tạo file `.env.local` cho development:

```
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

## 🚀 Deployment Checklist

- [ ] Setup Cloudflare Account
- [ ] Create D1 Database
- [ ] Configure wrangler.toml
- [ ] Run `wrangler auth`
- [ ] Run `npm run deploy`
- [ ] Test API endpoints

## 📞 Support

Nếu có vấn đề, check:
1. Cloudflare Workers logs
2. D1 Database status
3. CORS configuration

## 📄 License

MIT

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-28

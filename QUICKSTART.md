# 🚀 Quick Start Guide - Máy Tính Lãi/Phạt Cho Vay

## ⚡ 5 Phút Để Chạy Ứng Dụng

### Cách 1: Run Frontend (Dev Mode)

```bash
# Clone hoặc vào thư mục project
cd /home/u/Documents/lending-penalty

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở browser: **http://localhost:5173/**

### Cách 2: Production Build

```bash
npm run build
npm run preview
```

## 📱 Sử Dụng Ứng Dụng

1. **Nhập Số Tiền Vay** (VD: 1,000,000 VND)
2. **Chọn Ngày Vay** (VD: 01/01/2022)
3. **Nhập Lãi Suất** (VD: 20%/năm)
4. **Chọn Kỳ Hạn** (VD: 12 tháng)
5. **Nhập Phạt Suất** (VD: 40%/năm)
6. **Nhập Số Đã Thanh Toán** (Tùy chọn)
7. **Nhấn "Tính Toán"** 🔍

**Kết Quả Hiển Thị:**
- 💵 Gốc vay
- 📈 Lãi tích lũy
- 🔴 Tiền phạt
- 💰 Tổng nợ
- ❌ Còn nợ bao nhiêu
- 📊 Tỷ lệ thanh toán

## 🧮 Ví Dụ Cụ Thể

```
Vay: 1,000,000 VND
Ngày: 01/01/2022
Lãi: 20%/năm
Kỳ hạn: 12 tháng
Phạt: 40%/năm

Hôm nay: 28/05/2026
Kết quả:
- Gốc: 1,000,000 VND
- Lãi: ~2,288,000 VND
- Phạt (4 kỳ): ~9,000,000+ VND
- Tổng nợ: ~12,288,000+ VND
```

## 📂 Cấu Trúc Dự Án

```
lending-penalty/
├── src/
│   ├── components/
│   │   ├── LoanCalculator.jsx      ← Form nhập liệu
│   │   └── ResultsDisplay.jsx      ← Hiển thị kết quả
│   ├── utils/
│   │   └── calculations.js         ← Hàm tính toán
│   └── App.jsx                     ← Component chính
├── worker/                         ← Backend (Hono)
│   ├── src/
│   │   └── index.ts
│   ├── wrangler.toml
│   └── package.json
├── README.md                       ← Tài liệu đầy đủ
├── DEPLOYMENT.md                   ← Hướng dẫn triển khai
└── examples.js                     ← Test examples
```

## 🛠️ Công Nghệ Sử Dụng

| Phần | Công Nghệ |
|-----|----------|
| Frontend | React 18, Vite, Ant Design |
| Animation | Framer Motion |
| Date | dayjs |
| Backend | Hono, Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| CSS | CSS3, Gradient, Responsive |

## 🎨 Giao Diện

- ✨ Gradient background (Purple - Indigo)
- 📱 Responsive (Mobile, Tablet, Desktop)
- 🎬 Smooth animations
- 🎯 Color-coded statistics
- 💅 Modern card design

## 📊 Công Thức Tính Toán

### Lãi Kép
```
Lãi = Gốc × (1 + suất_lãi)^n - Gốc
```

### Phạt (Kép)
```
Phạt_kỳ_i = Nợ_kỳ_i × (1 + suất_phạt)^1 - Nợ_kỳ_i
```

### Quy Trình
```
Kỳ 1: (Gốc + Lãi) + Phạt
Kỳ 2: (Gốc + Lãi + Phạt_kỳ_1) + Phạt_kỳ_2
...
```

## ⚙️ Environment Setup

### Tạo .env.local (tùy chọn)

```
VITE_API_URL=http://localhost:8787
VITE_APP_NAME="Máy Tính Lãi/Phạt Cho Vay"
```

## 🧪 Test Example

```bash
npm run examples
```

Chạy các test case demo với dữ liệu mẫu.

## 🚀 Triển Khai Lên Production

### Backend (Cloudflare Workers)

```bash
cd worker
wrangler deploy
```

### Frontend (Cloudflare Pages)

```bash
npm run build
wrangler pages deploy dist --project-name lending-penalty
```

Xem [DEPLOYMENT.md](./DEPLOYMENT.md) để chi tiết.

## 🐛 Debugging

### Browser Console
```javascript
// Import utils để test
import { calculateLoanStatus } from './src/utils/calculations'

// Test calculation
const loan = {
  principal: 1000000,
  interestRate: 0.2,
  penaltyRate: 0.4,
  startDate: new Date('2022-01-01'),
  termMonths: 12,
  paidAmount: 0
}
console.log(calculateLoanStatus(loan))
```

### React DevTools
- Install React DevTools browser extension
- Inspect components, state, props

## 📞 FAQ

**Q: Tính lãi như thế nào?**
A: Lãi kép: `Gốc × (1 + rate)^n`

**Q: Phạt tính khi nào?**
A: Sau khi hết kỳ hạn, tính theo chu kỳ 12 tháng.

**Q: Có lưu dữ liệu không?**
A: Hiện tại chỉ frontend (tính toán ngay lập tức). Backend database (D1) sẽ được thêm.

**Q: Có API không?**
A: Có! Backend Hono ở folder `worker/`. Deploy lên Cloudflare Workers.

**Q: Tính 12 tháng = bao nhiêu ngày?**
A: 365 ngày (tính đơn giản).

## 🎯 Roadmap

- [x] Frontend tính toán
- [x] Hiệu ứng animation
- [x] Backend API (Hono)
- [ ] Database lưu trữ (D1)
- [ ] User authentication
- [ ] Export PDF report
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 💡 Tips

1. **Nhập ngày chính xác**: 01/01/2022 (format DD/MM/YYYY)
2. **Lãi suất %**: Nhập 20 (không phải 0.2)
3. **Xem chi tiết**: Scroll down để xem lịch sử phạt
4. **Test nhanh**: Sử dụng ví dụ mặc định rồi nhấn Calculate

## 📚 Tài Liệu Thêm

- [README.md](./README.md) - Tài liệu đầy đủ
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Hướng dẫn triển khai
- [worker/README.md](./worker/README.md) - API documentation
- [examples.js](./examples.js) - Test cases

## 🎉 Bắt Đầu Ngay!

```bash
# 1. Vào thư mục project
cd /home/u/Documents/lending-penalty

# 2. Cài dependencies
npm install

# 3. Chạy
npm run dev

# 4. Mở http://localhost:5173/
```

**Thưởng thức! 🚀**

---

**Version**: 1.0.0  
**Last Updated**: 28/05/2026

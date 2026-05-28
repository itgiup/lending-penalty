# 🏦 Máy Tính Lãi/Phạt Cho Vay

Ứng dụng web tính toán chi tiết khoản vay với lãi suất kép và tiền phạt động. Khi tiền phạt không được trả, nó tự động trở thành khoản vay mới với tính lãi/phạt tiếp theo.

## 🎯 Tính Năng

✅ **Tính Toán Lãi Kép**: Sử dụng công thức lãi kép (Compound Interest)
- `Gốc × (1 + suất_lãi)^n`

✅ **Phạt Động**: Phạt được tính theo chu kỳ 12 tháng (365 ngày)
- Chỉ tính phạt sau khi hết kỳ hạn vay
- Tiền phạt chưa trả tự động trở thành khoản vay mới
- Tính tiếp lãi/phạt cho khoản vay phạt

✅ **Thanh Toán Linh Hoạt**: Hỗ trợ thanh toán từng phần

✅ **Hiển Thị Trực Quan**: 
- Giao diện đẹp mắt với Ant Design
- Hiệu ứng animation mượt mà (framer-motion)
- Bảng lịch sử phạt chi tiết
- Biểu đồ tiến độ thanh toán

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 16
- npm hoặc yarn

## 🚀 Cài Đặt & Chạy

### Development
```bash
npm install
npm run dev
```

App sẽ chạy tại `http://localhost:5173/`

### Production Build
```bash
npm run build
npm run preview
```

## 📖 Cách Sử Dụng

1. **Nhập Thông Số**:
   - 💰 **Số Tiền Vay**: Số tiền gốc
   - 📅 **Ngày Vay**: Ngày bắt đầu khoản vay
   - 📈 **Lãi Suất**: Lãi suất hàng năm (%)
   - ⏰ **Kỳ Hạn**: Thời gian vay (tháng)
   - ⚠️ **Phạt Suất**: Mức phạt hàng năm nếu chậm trả (%)
   - ✅ **Đã Thanh Toán**: Số tiền đã thanh toán

2. **Tính Toán**: Nhấn nút "🔍 Tính Toán"

3. **Xem Kết Quả**:
   - 💵 Gốc vay
   - 📈 Lãi tích lũy
   - 🔴 Tiền phạt
   - 💰 Tổng nợ
   - ❌ Còn nợ
   - 📊 Tỷ lệ thanh toán

## 🧮 Công Thức Tính Toán

### Lãi Kép (Compound Interest)
```
Lãi = Gốc × (1 + suất_lãi)^n - Gốc
```
Trong đó:
- `n` = số kỳ hạn (tính theo năm)

### Phạt (Penalty)
- Tính mỗi 12 tháng (1 kỳ hạn)
- Công thức: `Phạt = Gốc_hiện_tại × (1 + suất_phạt)^n - Gốc_hiện_tại`
- Khi hết kỳ hạn và chưa thanh toán → tiền phạt trở thành khoản vay mới

### Ví Dụ
```
Vay: 1.000.000 VND
Ngày vay: 1/1/2022
Lãi suất: 20%/năm
Phạt suất: 40%/năm
Kỳ hạn: 12 tháng

Hạn chót: 1/1/2023

Nếu vẫn không trả đến hôm nay (28/5/2026):
- Gốc: 1.000.000
- Lãi (4.33 năm): ~2.288.000
- Phạt (4 kỳ): ~9.000.000+
- Tổng nợ: ~12.288.000+
```

## 📂 Cấu Trúc Project

```
src/
├── components/
│   ├── LoanCalculator.jsx      # Component form nhập liệu chính
│   ├── LoanCalculator.css
│   ├── ResultsDisplay.jsx      # Component hiển thị kết quả
│   └── ResultsDisplay.css
├── utils/
│   └── calculations.js         # Các hàm tính toán
├── App.jsx                     # Component chính
├── App.css
└── main.jsx
```

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18
- **Build**: Vite
- **UI Framework**: Ant Design (antd)
- **Animation**: Framer Motion
- **Date Handling**: dayjs
- **HTTP**: axios

## 📝 Công Thức Chi Tiết

### Tính Số Kỳ Hạn
```javascript
const periodsElapsed = daysDiff / 365
```

### Tính Lãi Tích Lũy
```javascript
const interest = principal * Math.pow(1 + interestRate, periodsElapsed) - principal
```

### Tính Tiền Phạt Lần Lượt
```
Kỳ 1: Phạt = (Gốc + Lãi) × (1 + suất_phạt)^1 - (Gốc + Lãi)
Kỳ 2: Phạt = (Gốc + Lãi + Phạt_kỳ_1) × (1 + suất_phạt)^1 - ...
...
```

## 🎨 Giao Diện

- Gradient background trôi chảy (Purple - Indigo)
- Card design với shadow mềm mại
- Responsive design (Mobile, Tablet, Desktop)
- Animation smooth khi hiển thị kết quả
- Color-coded statistics (xanh/vàng/đỏ)

## 📱 Responsive

- 📱 **Mobile**: < 576px
- 📱 **Tablet**: 576px - 992px
- 🖥️ **Desktop**: > 992px

## 🔄 Quy Trình Tính Phạt

```
Ngày 1/1/2022: Vay 1.000.000, lãi 20%, phạt 40%
  ↓
Ngày 1/1/2023: Hết kỳ hạn (không trả)
  → Nợ gốc = 1.000.000 + lãi = 1.200.000
  ↓
Ngày 1/1/2024: Chậm trả 1 năm
  → Phạt kỳ 1 = 1.200.000 × 40% = 480.000
  → Nợ mới = 1.200.000 + 480.000 = 1.680.000
  ↓
Ngày 1/1/2025: Chậm trả 2 năm
  → Phạt kỳ 2 = 1.680.000 × 40% = 672.000
  → Nợ mới = 1.680.000 + 672.000 = 2.352.000
  ↓
... (tiếp tục)
```

## 💾 Lưu Ý

- Tính toán dựa trên 12 tháng = 365 ngày (không tính năm nhuận)
- Phạt được tính lại theo chu kỳ 12 tháng (kỳ hạn vay)
- Hỗ trợ thanh toán từng phần
- Tất cả số tiền hiển thị bằng VND

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ hoặc tạo issue.

## 📄 License

MIT

---

**Phiên Bản**: 1.0.0  
**Cập Nhật**: 2026-05-28

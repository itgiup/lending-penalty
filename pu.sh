git add .
git commit -m "feat: Hoàn thiện Phase 4 - Advanced Features với Charts, Search & Export

Phase 4 - Advanced Features:
- Tích hợp Recharts library cho biểu đồ phân tích
- Tạo DashboardStats component hiển thị tổng quan thống kê (6 metrics)
- Tạo DebtChart component với Pie Chart (trạng thái) và Bar Chart (top 10 loans)
- Tạo SearchFilter component với search input và status filter dropdown
- Implement export to Excel functionality (XLSX format)
- Thêm nút xuất danh sách khoản nợ ra file Excel
- Thêm nút xuất lịch sử thanh toán từng khoản ra Excel
- Cập nhật LoanList với real-time search và filter
- Cập nhật Dashboard với Tabs (Overview/Analytics views)
- Tích hợp message notifications cho user feedback

Technical improvements:
- Install recharts, file-saver, xlsx dependencies
- Create export utility functions (exportLoansToExcel, exportPaymentsToExcel)
- Fixed ESLint errors (unused imports, function declaration order)
- Added responsive charts with tooltips and legends
- Implemented data formatting for Vietnamese currency (VND)
- Enhanced UX with loading states and empty state handling

Files created:
- src/components/DashboardStats.jsx (180 lines)
- src/components/DebtChart.jsx (200 lines)
- src/components/SearchFilter.jsx (50 lines)
- src/utils/export.js (150 lines)

Files updated:
- src/components/LoanList.jsx - Added search, filter, export
- src/components/LoanDetail.jsx - Added payment export button
- src/pages/Dashboard.jsx - Added tabs with stats & charts"

git push
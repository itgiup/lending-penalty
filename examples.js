/**
 * Test cases và examples cho hệ thống tính lãi/phạt
 */

import { calculateLoanStatus, calculatePeriods, calculateCompoundInterest } from './src/utils/calculations';

// Example 1: Ví dụ cơ bản từ user
console.log('=== Example 1: Vay 1 triệu, lãi 20%, phạt 40% ===');
const loan1 = {
  principal: 1000000,
  interestRate: 0.2,
  penaltyRate: 0.4,
  startDate: new Date('2022-01-01'),
  termMonths: 12,
  paidAmount: 0
};

const result1 = calculateLoanStatus(loan1, new Date('2026-05-28'));
console.log('Khoản vay gốc:', loan1.principal.toLocaleString('vi-VN'), 'VND');
console.log('Lãi tích lũy:', Math.round(result1.interest).toLocaleString('vi-VN'), 'VND');
console.log('Tiền phạt:', Math.round(result1.penalty).toLocaleString('vi-VN'), 'VND');
console.log('Tổng nợ:', Math.round(result1.totalDebt).toLocaleString('vi-VN'), 'VND');
console.log('Số kỳ phạt:', result1.penaltyLoans.length);
console.log('');

// Example 2: Người nào trả được một phần
console.log('=== Example 2: Vay 1 triệu + đã trả 5 triệu ===');
const loan2 = {
  principal: 1000000,
  interestRate: 0.2,
  penaltyRate: 0.4,
  startDate: new Date('2022-01-01'),
  termMonths: 12,
  paidAmount: 5000000
};

const result2 = calculateLoanStatus(loan2, new Date('2026-05-28'));
console.log('Tổng nợ:', Math.round(result2.totalDebt).toLocaleString('vi-VN'), 'VND');
console.log('Đã trả:', Math.round(result2.paidAmount).toLocaleString('vi-VN'), 'VND');
console.log('Còn nợ:', Math.round(result2.remainingDebt).toLocaleString('vi-VN'), 'VND');
console.log('');

// Example 3: Khoản vay còn trong kỳ hạn (chưa quá hạn)
console.log('=== Example 3: Khoản vay còn trong kỳ hạn ===');
const loan3 = {
  principal: 1000000,
  interestRate: 0.2,
  penaltyRate: 0.4,
  startDate: new Date('2026-03-01'),
  termMonths: 12,
  paidAmount: 0
};

const result3 = calculateLoanStatus(loan3, new Date('2026-05-28'));
console.log('Ngày vay:', loan3.startDate.toLocaleDateString('vi-VN'));
console.log('Hạn chót:', result3.dueDate.toLocaleDateString('vi-VN'));
console.log('Quá hạn:', result3.isOverdue ? 'CÓ' : 'KHÔNG');
console.log('Lãi hiện tại:', Math.round(result3.interest).toLocaleString('vi-VN'), 'VND');
console.log('Tiền phạt:', result3.penalty === 0 ? 'Không có' : Math.round(result3.penalty).toLocaleString('vi-VN'), 'VND');
console.log('');

// Example 4: Chi tiết từng kỳ phạt
console.log('=== Example 4: Chi tiết từng kỳ phạt ===');
console.log('Kỳ | Gốc/Nợ | Tiền Phạt | Tổng Nợ');
console.log('---|--------|----------|--------');
result1.penaltyLoans.forEach(penalty => {
  console.log(
    penalty.period,
    '|',
    Math.round(penalty.base).toLocaleString('vi-VN'),
    '|',
    Math.round(penalty.penalty).toLocaleString('vi-VN'),
    '|',
    Math.round(penalty.total).toLocaleString('vi-VN')
  );
});
console.log('');

// Example 5: Tính lãi kép đơn giản
console.log('=== Example 5: Tính Lãi Kép Đơn Giản ===');
const principal = 1000000;
const rate = 0.2;

for (let year = 1; year <= 5; year++) {
  const interest = calculateCompoundInterest(principal, rate, year);
  const total = principal + interest;
  console.log(
    `Năm ${year}: Gốc = ${principal.toLocaleString('vi-VN')}, `,
    `Lãi = ${Math.round(interest).toLocaleString('vi-VN')}, `,
    `Tổng = ${Math.round(total).toLocaleString('vi-VN')}`
  );
}
console.log('');

// Example 6: So sánh lãi đơn vs lãi kép
console.log('=== Example 6: So Sánh Lãi Đơn vs Kép ===');
const simpleInterest = principal * rate * 3; // 3 năm
const compoundInterest = calculateCompoundInterest(principal, rate, 3);

console.log('Sau 3 năm, lãi suất 20%/năm:');
console.log('Lãi đơn:', Math.round(simpleInterest).toLocaleString('vi-VN'), 'VND');
console.log('Lãi kép:', Math.round(compoundInterest).toLocaleString('vi-VN'), 'VND');
console.log('Chênh lệch:', Math.round(compoundInterest - simpleInterest).toLocaleString('vi-VN'), 'VND');
console.log('');

// Example 7: Dự báo sau N năm
console.log('=== Example 7: Dự Báo Nợ Sau N Năm ===');
for (let months = 0; months <= 48; months += 12) {
  const futureDate = new Date('2022-01-01');
  futureDate.setMonth(futureDate.getMonth() + months);
  
  const prediction = calculateLoanStatus(loan1, futureDate);
  console.log(
    `Sau ${months} tháng (${futureDate.toLocaleDateString('vi-VN')}): `,
    `Tổng nợ = ${Math.round(prediction.totalDebt).toLocaleString('vi-VN')} VND`
  );
}

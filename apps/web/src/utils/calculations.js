/**
 * Hàm tính toán lãi/phạt cho vay
 * Lãi/Phạt tính theo công thức kép: (1 + suất)^n
 */

// Tính số kỳ hạn từ ngày vay đến hiện tại
export const calculatePeriods = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  return daysDiff / 365; // 12 tháng = 365 ngày
};

// Tính lãi kép: Principal × (1 + rate)^periods - Principal
export const calculateCompoundInterest = (principal, annualRate, periods) => {
  const totalAmount = principal * Math.pow(1 + annualRate, periods);
  return totalAmount - principal;
};

// Tính tổng số tiền phải trả
export const calculateTotalAmount = (principal, annualRate, periods) => {
  return principal * Math.pow(1 + annualRate, periods);
};

/**
 * Tính toàn bộ khoản vay tại một thời điểm
 * @param {Object} loan - Thông tin khoản vay
 * @param {number} loan.principal - Số tiền gốc vay
 * @param {number} loan.interestRate - Lãi suất/năm (0.2 = 20%)
 * @param {number} loan.penaltyRate - Phạt suất/năm (0.4 = 40%)
 * @param {Date} loan.startDate - Ngày vay
 * @param {number} loan.termMonths - Kỳ hạn (tháng)
 * @param {number} loan.paidAmount - Số tiền đã thanh toán
 * @param {Date} currentDate - Thời điểm tính toán
 * @returns {Object} Chi tiết tính toán
 */
export const calculateLoanStatus = (loan, currentDate = new Date()) => {
  const {
    principal,
    interestRate,
    penaltyRate,
    startDate,
    termMonths,
    paidAmount = 0
  } = loan;

  // Chuyển kỳ hạn (tháng) thành năm
  const termYears = termMonths / 12;
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + termMonths * (365 / 12));

  const periodsUntilDue = calculatePeriods(startDate, dueDate);
  const periodsElapsed = calculatePeriods(startDate, currentDate);

  // Tính lãi tới hạn
  const interestUntilDue = calculateCompoundInterest(
    principal,
    interestRate,
    periodsUntilDue
  );
  const totalUntilDue = principal + interestUntilDue;

  // Tính lãi thực tế đã tích lũy
  const interestActual = calculateCompoundInterest(
    principal,
    interestRate,
    periodsElapsed
  );

  let penalty = 0;
  let penaltyLoans = []; // Danh sách các khoản vay từ phạt

  if (currentDate > dueDate) {
    // Tính phạt nếu chậm trả
    const periodsSinceDue = calculatePeriods(dueDate, currentDate);

    // Phạt được tính lại mỗi 12 tháng (1 kỳ hạn)
    const completePenaltyPeriods = Math.floor(periodsSinceDue / termYears);

    if (completePenaltyPeriods > 0) {
      // Tính các kỳ phạt lần lượt
      let currentPenaltyBase = totalUntilDue;

      for (let i = 0; i < completePenaltyPeriods; i++) {
        const penaltyForThisPeriod = calculateCompoundInterest(
          currentPenaltyBase,
          penaltyRate,
          termYears
        );

        penaltyLoans.push({
          period: i + 1,
          base: currentPenaltyBase,
          penalty: penaltyForThisPeriod,
          total: currentPenaltyBase + penaltyForThisPeriod
        });

        currentPenaltyBase += penaltyForThisPeriod;
        penalty += penaltyForThisPeriod;
      }
    }
  }

  // Tính số tiền còn nợ
  const totalDebt = principal + interestActual + penalty;
  const remainingDebt = Math.max(0, totalDebt - paidAmount);

  return {
    principal,
    interest: interestActual,
    penalty,
    totalDebt,
    paidAmount,
    remainingDebt,
    dueDate,
    currentDate,
    isOverdue: currentDate > dueDate,
    periodsElapsed,
    penaltyLoans,
    details: {
      interestRate,
      penaltyRate,
      termMonths,
      startDate
    }
  };
};

/**
 * Lịch sử phạt - hiển thị từng kỳ phạt
 */
export const generatePenaltySchedule = (loan, maxPeriods = 10) => {
  const { penaltyLoans } = calculateLoanStatus(loan);
  return penaltyLoans.slice(0, maxPeriods);
};

/**
 * Dự báo - nếu tiếp tục không trả, sẽ nợ bao nhiêu sau N tháng
 */
export const predictFutureDebt = (loan, monthsAhead) => {
  const futureDate = new Date(loan.startDate);
  futureDate.setMonth(futureDate.getMonth() + monthsAhead);

  return calculateLoanStatus(loan, futureDate);
};

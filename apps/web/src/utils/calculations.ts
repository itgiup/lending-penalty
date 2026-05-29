/**
 * Hàm tính toán lãi/phạt cho vay
 * Lãi/Phạt tính theo công thức kép: (1 + suất)^n
 */

interface LoanCalculationInput {
  principal: number;
  interestRate: number;
  penaltyRate: number;
  startDate: string | Date;
  termMonths: number;
  paidAmount?: number;
}

interface PenaltyLoan {
  period: number;
  base: number;
  penalty: number;
  total: number;
}

interface LoanCalculationResult {
  principal: number;
  interest: number;
  penalty: number;
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
  dueDate: Date;
  currentDate: Date;
  isOverdue: boolean;
  periodsElapsed: number;
  penaltyLoans: PenaltyLoan[];
  details: {
    interestRate: number;
    penaltyRate: number;
    termMonths: number;
    startDate: string | Date;
  };
}

// Tính số kỳ hạn từ ngày vay đến hiện tại
export const calculatePeriods = (startDate: string | Date, endDate: Date = new Date()): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff / 365; // 12 tháng = 365 ngày
};

// Tính lãi kép: Principal × (1 + rate)^periods - Principal
export const calculateCompoundInterest = (principal: number, annualRate: number, periods: number): number => {
  const totalAmount = principal * Math.pow(1 + annualRate, periods);
  return totalAmount - principal;
};

// Tính tổng số tiền phải trả
export const calculateTotalAmount = (principal: number, annualRate: number, periods: number): number => {
  return principal * Math.pow(1 + annualRate, periods);
};

/**
 * Tính toàn bộ khoản vay tại một thời điểm
 * @param loan - Thông tin khoản vay
 * @param currentDate - Thời điểm tính toán
 * @returns Chi tiết tính toán
 */
export const calculateLoanStatus = (loan: LoanCalculationInput, currentDate: Date = new Date()): LoanCalculationResult => {
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
  const penaltyLoans: PenaltyLoan[] = []; // Danh sách các khoản vay từ phạt

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
export const generatePenaltySchedule = (loan: LoanCalculationInput, maxPeriods: number = 10): PenaltyLoan[] => {
  const { penaltyLoans } = calculateLoanStatus(loan);
  return penaltyLoans.slice(0, maxPeriods);
};

/**
 * Dự báo - nếu tiếp tục không trả, sẽ nợ bao nhiêu sau N tháng
 */
export const predictFutureDebt = (loan: LoanCalculationInput, monthsAhead: number): LoanCalculationResult => {
  const futureDate = new Date(loan.startDate);
  futureDate.setMonth(futureDate.getMonth() + monthsAhead);

  return calculateLoanStatus(loan, futureDate);
};
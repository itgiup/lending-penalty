import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { Loan, Payment } from '@lending-penalty/shared';

interface PaymentsAPI {
  getByLoanId: (loanId: string) => Promise<{ data: Payment[] }>;
}

interface LoansAPI {
  calculate: (data: any) => Promise<{ data: any }>;
}

/**
 * Export loans data to Excel/CSV
 */
export const exportLoansToExcel = async (loans: Loan[], paymentsAPI: PaymentsAPI, loansAPI: LoansAPI): Promise<boolean> => {
  try {
    const data: Record<string, any>[] = [];

    for (const loan of loans) {
      // Get payments for this loan
      const paymentsRes = await paymentsAPI.getByLoanId(loan.id);
      const payments = paymentsRes.data || [];
      const totalPaid = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);

      // Calculate current status
      const calcRes = await loansAPI.calculate({
        principal: loan.principal,
        interestRate: loan.interest_rate,
        penaltyRate: loan.penalty_rate,
        startDate: loan.start_date,
        termMonths: loan.term_months,
        paidAmount: totalPaid
      });

      const calc = calcRes.data;

      data.push({
        'Mã khoản': loan.id,
        'Người vay': loan.borrower_name,
        'SĐT': loan.borrower_phone || '',
        'Địa chỉ': loan.borrower_address || '',
        'Gốc (VND)': loan.principal,
        'Lãi suất (%)': loan.interest_rate,
        'Phạt suất (%)': loan.penalty_rate,
        'Ngày bắt đầu': dayjs(loan.start_date).format('DD/MM/YYYY'),
        'Kỳ hạn (tháng)': loan.term_months,
        'Hạn chót': dayjs(calc.dueDate).format('DD/MM/YYYY'),
        'Trạng thái': loan.status === 'active' ? 'Đang nợ' : 
                     loan.status === 'paid' ? 'Đã trả' : 'Quá hạn',
        'Tổng lãi': Math.round(calc.interest),
        'Tổng phạt': Math.round(calc.penalty),
        'Tổng nợ': Math.round(calc.totalDebt),
        'Đã trả': totalPaid,
        'Còn lại': Math.round(calc.remainingDebt),
        'Số lần thanh toán': payments.length,
        'Ghi chú': loan.notes || ''
      });
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 25 }, // Name
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 15 }, // Principal
      { wch: 12 }, // Interest rate
      { wch: 12 }, // Penalty rate
      { wch: 15 }, // Start date
      { wch: 12 }, // Term
      { wch: 15 }, // Due date
      { wch: 12 }, // Status
      { wch: 15 }, // Interest
      { wch: 15 }, // Penalty
      { wch: 15 }, // Total debt
      { wch: 15 }, // Paid
      { wch: 15 }, // Remaining
      { wch: 12 }, // Payment count
      { wch: 30 }  // Notes
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Khoản Nợ');

    // Generate file
    const fileName = `danhsach_khoanno_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

/**
 * Export payments history to Excel
 */
export const exportPaymentsToExcel = async (loanId: string, loanName: string, paymentsAPI: PaymentsAPI): Promise<boolean> => {
  try {
    const paymentsRes = await paymentsAPI.getByLoanId(loanId);
    const payments = paymentsRes.data || [];

    if (payments.length === 0) {
      throw new Error('Không có lịch sử thanh toán');
    }

    const data = payments.map(payment => ({
      'Ngày thanh toán': dayjs(payment.payment_date).format('DD/MM/YYYY'),
      'Số tiền (VND)': payment.amount,
      'Ghi chú': payment.notes || '',
      'Ngày ghi nhận': dayjs(payment.created_at).format('DD/MM/YYYY HH:mm:ss')
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
      { wch: 25 }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch Sử Thanh Toán');

    // Generate file
    const fileName = `thanhtoan_${loanName.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};
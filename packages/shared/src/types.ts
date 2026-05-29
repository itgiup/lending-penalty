// Shared TypeScript Types (domain models only - request types are in schemas.ts)

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  borrower_name: string;
  borrower_phone?: string;
  borrower_address?: string;
  principal: number;
  interest_rate: number;
  penalty_rate: number;
  start_date: string;
  term_months: number;
  status: 'active' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface LoanCalculation {
  principal: number;
  interest: number;
  penalty: number;
  totalDebt: number;
  remainingDebt: number;
  dueDate: string;
  isOverdue: boolean;
  penaltyLoans?: Array<{
    period: number;
    base: number;
    penalty: number;
    total: number;
  }>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

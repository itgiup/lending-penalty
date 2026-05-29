import { z } from 'zod';

// Zod Schemas for validation (shared between client and server)

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number').optional()
});

export const createLoanSchema = z.object({
  borrower_name: z.string().min(2, 'Borrower name is required'),
  borrower_phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number').optional(),
  borrower_address: z.string().optional(),
  principal: z.number().positive('Principal must be positive'),
  interest_rate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  penalty_rate: z.number().min(0).max(100, 'Penalty rate must be between 0 and 100'),
  start_date: z.string().datetime('Invalid date format'),
  term_months: z.number().int().min(1).max(360, 'Term must be between 1 and 360 months'),
  notes: z.string().optional()
});

export const updateLoanSchema = createLoanSchema.partial();

export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().datetime('Invalid date format'),
  notes: z.string().optional()
});

export const calculateLoanSchema = z.object({
  principal: z.number().positive(),
  interestRate: z.number().min(0),
  penaltyRate: z.number().min(0),
  startDate: z.string().datetime(),
  termMonths: z.number().int().positive(),
  paidAmount: z.number().min(0).default(0)
});

// Type exports
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type CreateLoanRequest = z.infer<typeof createLoanSchema>;
export type UpdateLoanRequest = z.infer<typeof updateLoanSchema>;
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type CalculateLoanRequest = z.infer<typeof calculateLoanSchema>;

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// ============================================
// CALCULATION FUNCTIONS (from shared utils)
// ============================================

const calculatePeriods = (startDate: string | Date, endDate: Date = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff / 365;
};

const calculateCompoundInterest = (principal: number, annualRate: number, periods: number) => {
  const totalAmount = principal * Math.pow(1 + annualRate, periods);
  return totalAmount - principal;
};

interface LoanCalculation {
  principal: number;
  interestRate: number;
  penaltyRate: number;
  startDate: Date | string;
  termMonths: number;
  paidAmount?: number;
}

const calculateLoanStatus = (loan: LoanCalculation, currentDate: Date = new Date()) => {
  const {
    principal,
    interestRate,
    penaltyRate,
    startDate,
    termMonths,
    paidAmount = 0
  } = loan;

  const termYears = termMonths / 12;
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + termMonths * (365 / 12));

  const periodsUntilDue = calculatePeriods(startDate, dueDate);
  const periodsElapsed = calculatePeriods(startDate, currentDate);

  const interestUntilDue = calculateCompoundInterest(principal, interestRate, periodsUntilDue);
  const totalUntilDue = principal + interestUntilDue;

  const interestActual = calculateCompoundInterest(principal, interestRate, periodsElapsed);

  let penalty = 0;
  let penaltyLoans: any[] = [];

  if (currentDate > dueDate) {
    const periodsSinceDue = calculatePeriods(dueDate, currentDate);
    const completePenaltyPeriods = Math.floor(periodsSinceDue / termYears);

    if (completePenaltyPeriods > 0) {
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

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const loanSchema = z.object({
  borrower_name: z.string().min(1, 'Borrower name is required'),
  borrower_phone: z.string().optional(),
  borrower_address: z.string().optional(),
  principal: z.number().positive('Principal must be positive'),
  interest_rate: z.number().min(0).max(100),
  penalty_rate: z.number().min(0).max(100),
  start_date: z.string().datetime('Invalid date format'),
  term_months: z.number().int().positive('Term must be positive'),
  notes: z.string().optional()
});

const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().datetime('Invalid date format'),
  notes: z.string().optional()
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Lending Penalty Calculator API',
    version: '2.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      loans: {
        list: 'GET /api/loans',
        create: 'POST /api/loans',
        get: 'GET /api/loans/:id',
        update: 'PUT /api/loans/:id',
        delete: 'DELETE /api/loans/:id',
        calculate: 'POST /api/loans/calculate'
      },
      payments: {
        list: 'GET /api/loans/:id/payments',
        create: 'POST /api/loans/:id/payments',
        delete: 'DELETE /api/payments/:id'
      }
    }
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/auth/register', zValidator('json', registerSchema), async (c) => {
  try {
    const db = c.env.DB;
    const { email, password, name, phone } = c.req.valid('json');

    // Check if user exists
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Hash password (in production, use bcrypt)
    const password_hash = password; // TODO: Implement proper hashing
    const id = generateId();

    await db.prepare(
      'INSERT INTO users (id, email, password_hash, name, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
    ).bind(id, email, password_hash, name || null, phone || null).run();

    return c.json({ 
      success: true, 
      message: 'Registration successful',
      user: { id, email, name, phone }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Registration failed', message: error.message }, 500);
  }
});

// Login
app.post('/api/auth/login', zValidator('json', loginSchema), async (c) => {
  try {
    const db = c.env.DB;
    const { email, password } = c.req.valid('json');

    const user = await db.prepare(
      'SELECT id, email, password_hash, name, phone FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user || user.password_hash !== password) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // TODO: Generate JWT token
    return c.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
      // token: jwt_token
    });
  } catch (error) {
    return c.json({ error: 'Login failed', message: error.message }, 500);
  }
});

// Get user profile (protected route - needs auth middleware)
app.get('/api/auth/profile', async (c) => {
  // TODO: Add authentication middleware
  return c.json({ message: 'Protected route - needs authentication' });
});

// ============================================
// LOANS ROUTES
// ============================================

// List all loans for user
app.get('/api/loans', async (c) => {
  try {
    const db = c.env.DB;
    // TODO: Get user_id from auth token
    const user_id = 'temp-user-id'; // Temporary

    const loans = await db.prepare(
      'SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(user_id).all();

    return c.json(loans.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch loans', message: error.message }, 500);
  }
});

// Create new loan
app.post('/api/loans', zValidator('json', loanSchema), async (c) => {
  try {
    const db = c.env.DB;
    const data = c.req.valid('json');
    // TODO: Get user_id from auth token
    const user_id = 'temp-user-id'; // Temporary
    const id = generateId();

    await db.prepare(
      `INSERT INTO loans (id, user_id, borrower_name, borrower_phone, borrower_address, 
       principal, interest_rate, penalty_rate, start_date, term_months, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))`
    ).bind(
      id,
      user_id,
      data.borrower_name,
      data.borrower_phone || null,
      data.borrower_address || null,
      data.principal,
      data.interest_rate,
      data.penalty_rate,
      data.start_date,
      data.term_months,
      data.notes || null
    ).run();

    return c.json({ success: true, id, message: 'Loan created' }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create loan', message: error.message }, 500);
  }
});

// Get loan by ID
app.get('/api/loans/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    const loan = await db.prepare('SELECT * FROM loans WHERE id = ?').bind(id).first();

    if (!loan) {
      return c.json({ error: 'Loan not found' }, 404);
    }

    return c.json(loan);
  } catch (error) {
    return c.json({ error: 'Failed to fetch loan', message: error.message }, 500);
  }
});

// Update loan
app.put('/api/loans/:id', zValidator('json', loanSchema.partial()), async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = c.req.valid('json');

    // Build dynamic update query
    const fields = Object.keys(data);
    if (fields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => data[f]);

    await db.prepare(
      `UPDATE loans SET ${setClause}, updated_at = datetime("now") WHERE id = ?`
    ).bind(...values, id).run();

    return c.json({ success: true, message: 'Loan updated' });
  } catch (error) {
    return c.json({ error: 'Failed to update loan', message: error.message }, 500);
  }
});

// Delete loan
app.delete('/api/loans/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    await db.prepare('DELETE FROM loans WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Loan deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete loan', message: error.message }, 500);
  }
});

// Calculate loan status (public endpoint)
app.post('/api/loans/calculate', async (c) => {
  try {
    const body = await c.req.json();
    
    const loan = {
      principal: body.principal,
      interestRate: body.interestRate / 100,
      penaltyRate: body.penaltyRate / 100,
      startDate: new Date(body.startDate),
      termMonths: body.termMonths,
      paidAmount: body.paidAmount || 0
    };

    const result = calculateLoanStatus(loan);
    
    return c.json(result, 200);
  } catch (error) {
    return c.json({ error: 'Invalid request', message: error.message }, 400);
  }
});

// ============================================
// PAYMENTS ROUTES
// ============================================

// List payments for a loan
app.get('/api/loans/:id/payments', async (c) => {
  try {
    const db = c.env.DB;
    const loan_id = c.req.param('id');

    const payments = await db.prepare(
      'SELECT * FROM payments WHERE loan_id = ? ORDER BY payment_date DESC'
    ).bind(loan_id).all();

    return c.json(payments.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch payments', message: error.message }, 500);
  }
});

// Record payment
app.post('/api/loans/:id/payments', zValidator('json', paymentSchema), async (c) => {
  try {
    const db = c.env.DB;
    const loan_id = c.req.param('id');
    const data = c.req.valid('json');
    const id = generateId();

    await db.prepare(
      'INSERT INTO payments (id, loan_id, amount, payment_date, notes, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))'
    ).bind(id, loan_id, data.amount, data.payment_date, data.notes || null).run();

    // Update loan status if fully paid
    const loan = await db.prepare('SELECT principal FROM loans WHERE id = ?').bind(loan_id).first();
    const totalPaid = await db.prepare(
      'SELECT SUM(amount) as total FROM payments WHERE loan_id = ?'
    ).bind(loan_id).first();

    if (totalPaid.total >= loan.principal) {
      await db.prepare(
        'UPDATE loans SET status = "paid", updated_at = datetime("now") WHERE id = ?'
      ).bind(loan_id).run();
    }

    return c.json({ success: true, id, message: 'Payment recorded' }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to record payment', message: error.message }, 500);
  }
});

// Delete payment
app.delete('/api/payments/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    await db.prepare('DELETE FROM payments WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete payment', message: error.message }, 500);
  }
});

export default app;
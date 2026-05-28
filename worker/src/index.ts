import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// Tính toán hàm từ shared utils
const calculatePeriods = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  return daysDiff / 365;
};

const calculateCompoundInterest = (principal, annualRate, periods) => {
  const totalAmount = principal * Math.pow(1 + annualRate, periods);
  return totalAmount - principal;
};

const calculateLoanStatus = (loan, currentDate = new Date()) => {
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
  let penaltyLoans = [];

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

// Routes

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Calculate loan status
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

// Create a new loan (future: with database)
app.post('/api/loans', async (c) => {
  try {
    const body = await c.req.json();
    
    // In the future, this will save to D1 database
    const loan = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date().toISOString()
    };

    return c.json(loan, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create loan', message: error.message }, 400);
  }
});

// Get loan details (future: from database)
app.get('/api/loans/:id', async (c) => {
  const id = c.req.param('id');
  
  // In the future, this will fetch from D1 database
  return c.json({ message: 'Loan not found', id }, 404);
});

// Record a payment
app.post('/api/loans/:id/payment', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // In the future, this will update D1 database
    return c.json({ 
      success: true, 
      message: 'Payment recorded',
      id,
      amount: body.amount
    }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to record payment', message: error.message }, 400);
  }
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Lending Penalty Calculator API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      calculate: 'POST /api/loans/calculate',
      createLoan: 'POST /api/loans',
      getLoan: 'GET /api/loans/:id',
      recordPayment: 'POST /api/loans/:id/payment'
    }
  });
});

export default app;

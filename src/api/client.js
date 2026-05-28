import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile')
};

// ============================================
// LOANS API
// ============================================

export const loansAPI = {
  // Get all loans for current user
  getAll: () => api.get('/api/loans'),
  
  // Get single loan by ID
  getById: (id) => api.get(`/api/loans/${id}`),
  
  // Create new loan
  create: (data) => api.post('/api/loans', data),
  
  // Update loan
  update: (id, data) => api.put(`/api/loans/${id}`, data),
  
  // Delete loan
  delete: (id) => api.delete(`/api/loans/${id}`),
  
  // Calculate loan status (public endpoint)
  calculate: (data) => api.post('/api/loans/calculate', data)
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsAPI = {
  // Get all payments for a loan
  getByLoanId: (loanId) => api.get(`/api/loans/${loanId}/payments`),
  
  // Record new payment
  create: (loanId, data) => api.post(`/api/loans/${loanId}/payments`, data),
  
  // Delete payment
  delete: (paymentId) => api.delete(`/api/payments/${paymentId}`)
};

export default api;
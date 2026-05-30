import { hc } from 'hono/client';
import type { AppType } from '@lending-penalty/api/src/index';

const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

// Create type-safe Hono RPC client
export const apiClient = hc<AppType>(API_URL);

// Export typed API functions for easier use
export const authAPI = {
  login: (data: { email: string; password: string }) => 
    apiClient.auth.login.$post({ json: data }),
  
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    apiClient.auth.register.$post({ json: data }),
  
  getProfile: () =>
    apiClient.auth.profile.$get(),
  
  google: (data: { credential: string }) =>
    apiClient.auth.google.$post({ json: data }),
  
  facebook: (data: { accessToken: string; userID: string }) =>
    apiClient.auth.facebook.$post({ json: data })
};

export const loansAPI = {
  getAll: () =>
    apiClient.loans.$get(),
  
  getById: (id: string) =>
    apiClient.loans[':id'].$get({ param: { id } }),
  
  create: (data: any) =>
    apiClient.loans.$post({ json: data }),
  
  update: (id: string, data: any) =>
    apiClient.loans[':id'].$put({ param: { id }, json: data }),
  
  delete: (id: string) =>
    apiClient.loans[':id'].$delete({ param: { id } }),
  
  calculate: (data: any) =>
    apiClient.loans.calculate.$post({ json: data })
};

export const paymentsAPI = {
  getByLoanId: (loanId: string) =>
    apiClient.loans[':loanId'].payments.$get({ param: { loanId } }),
  
  create: (loanId: string, data: any) =>
    apiClient.loans[':loanId'].payments.$post({ param: { loanId }, json: data }),
  
  delete: (id: string) =>
    apiClient.payments[':id'].$delete({ param: { id } })
};
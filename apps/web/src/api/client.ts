import { hc } from 'hono/client';
import type { AppType } from '@lending-penalty/api/src/index';
import { API_BASE_URL } from '@lending-penalty/shared';

// Create type-safe Hono RPC client
export const apiClient = hc<AppType>(API_BASE_URL);

// Export typed API functions for easier use
export const authAPI = {
  login: (data: { email: string; password: string }) => 
    apiClient.api.auth.login.$post({ json: data }),
  
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    apiClient.api.auth.register.$post({ json: data }),
  
  getProfile: () =>
    apiClient.api.auth.profile.$get()
};

export const loansAPI = {
  getAll: () =>
    apiClient.api.loans.$get(),
  
  getById: (id: string) =>
    apiClient.api.loans[':id'].$get({ param: { id } }),
  
  create: (data: any) =>
    apiClient.api.loans.$post({ json: data }),
  
  update: (id: string, data: any) =>
    apiClient.api.loans[':id'].$put({ param: { id }, json: data }),
  
  delete: (id: string) =>
    apiClient.api.loans[':id'].$delete({ param: { id } }),
  
  calculate: (data: any) =>
    apiClient.api.loans.calculate.$post({ json: data })
};

export const paymentsAPI = {
  getByLoanId: (loanId: string) =>
    apiClient.api.loans[':loanId'].payments.$get({ param: { loanId } }),
  
  create: (loanId: string, data: any) =>
    apiClient.api.loans[':loanId'].payments.$post({ param: { loanId }, json: data }),
  
  delete: (id: string) =>
    apiClient.api.payments[':id'].$delete({ param: { id } })
};

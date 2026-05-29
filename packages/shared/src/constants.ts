// Shared constants

export const APP_NAME = 'Lending Penalty';
// Remove import.meta.env from shared package - use in web app only
export const API_BASE_URL = 'http://localhost:8787';

export const LOAN_STATUS = {
  ACTIVE: 'active',
  PAID: 'paid',
  OVERDUE: 'overdue'
} as const;

export const CURRENCY_FORMAT = {
  locale: 'vi-VN',
  currency: 'VND'
};

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};
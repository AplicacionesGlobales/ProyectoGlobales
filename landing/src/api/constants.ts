// API Base URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER_BRAND: '/auth/register/brand',
    LOGIN_ADMIN: '/auth/login/admin',
    LOGIN_CLIENT: '/auth/login/client',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE: '/payment/create',
    CALLBACK: '/payment/callback',
  },
  
  // Health check
  HEALTH: '/health',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000;

// Plan pricing constants
export const PLAN_PRICING = {
  BASE: {
    app: 59,
    completo: 60,
    web: 0,
  },
  SERVICES: {
    citas: 20,
    ubicaciones: 15,
    archivos: 25,
    pagos: 30,
    reportes: 15,
  },
  ANNUAL_MULTIPLIER: 12,
} as const;

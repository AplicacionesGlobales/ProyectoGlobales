// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Landing data endpoints (optimized)
  LANDING: {
    CONFIG: '/landing-data/config',
    BUSINESS_TYPES: '/landing-data/business-types',
    FEATURES: '/landing-data/features',
    PLANS: '/landing-data/plans',
    BUSINESS_TYPE_CONFIG: (businessType: string) => `/landing-data/business-type/${businessType}/config`,
    FEATURES_FOR_BUSINESS: (businessType: string) => `/landing-data/features/business-type/${businessType}`,
  },
  
  // Auth endpoints
  AUTH: {
    REGISTER_BRAND: '/auth/register/brand',
    LOGIN_ADMIN: '/auth/login/admin',
    LOGIN_CLIENT: '/auth/login/client',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Validation endpoints
  VALIDATE: {
    EMAIL: '/validate/email',
    USERNAME: '/validate/username',
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE: '/payment/create',
    CALLBACK: '/payment/callback',
  },
  
  // Health check
  HEALTH: '/health',
} as const;

// Request configuration
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
} as const;

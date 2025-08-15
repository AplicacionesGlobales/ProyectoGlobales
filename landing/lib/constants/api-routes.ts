/**
 * API Routes Constants
 * Centralized configuration for all API endpoints
 */

// Base configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// API Routes organized by domain
export const API_ROUTES = {
  // Landing data endpoints
  LANDING: {
    CONFIG: '/landing-data/config',
    BUSINESS_TYPES: '/landing-data/business-types',
    FEATURES: '/landing-data/features',
    PLANS: '/landing-data/plans',
    BUSINESS_TYPE_CONFIG: (businessType: string) => `/landing-data/business-type/${businessType}/config`,
    FEATURES_FOR_BUSINESS: (businessType: string) => `/landing-data/features/business-type/${businessType}`,
  },
  
  // Authentication endpoints
  AUTH: {
    REGISTER_BRAND: '/auth/register/brand',
    LOGIN_ADMIN: '/auth/login/admin',
    LOGIN_CLIENT: '/auth/login/client',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Validation endpoints
  VALIDATION: {
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

// Request configuration presets
export const REQUEST_CONFIG = {
  DEFAULT: {
    headers: API_CONFIG.HEADERS,
    timeout: API_CONFIG.TIMEOUT,
  },
  FORM_DATA: {
    timeout: API_CONFIG.TIMEOUT,
    // Content-Type will be set automatically for FormData
  },
  FILE_UPLOAD: {
    timeout: 30000, // 30 seconds for file uploads
  },
} as const;

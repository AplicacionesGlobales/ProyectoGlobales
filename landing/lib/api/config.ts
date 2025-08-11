// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER_BRAND: '/auth/register/brand',
  LOGIN_ADMIN: '/auth/login/admin',
  LOGIN_CLIENT: '/auth/login/client',
  
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

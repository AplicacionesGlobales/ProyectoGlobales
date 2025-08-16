// app/api/config.ts

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
    LOGIN: '/auth/login',
    LOGIN_ADMIN: '/auth/login/admin',
    LOGIN_CLIENT: '/auth/login/client',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // Brand management endpoints
  BRAND: {
    BASE: '/brand',
    GET_INFO: (brandId: number) => `/brand/${brandId}`,
    UPDATE: (brandId: number) => `/brand/${brandId}`,
    
    // Users
    GET_USERS: (brandId: number) => `/brand/${brandId}/users`,
    CREATE_USER: (brandId: number) => `/brand/${brandId}/users`,
    UPDATE_USER: (brandId: number, userId: number) => `/brand/${brandId}/users/${userId}`,
    DELETE_USER: (brandId: number, userId: number) => `/brand/${brandId}/users/${userId}`,
    
    // Features
    UPDATE_FEATURES: (brandId: number) => `/brand/${brandId}/features`,
    
    // Plan
    GET_PLAN: (brandId: number) => `/brand/${brandId}/plan`,
    UPDATE_PLAN: (brandId: number) => `/brand/${brandId}/plan`,
    
    // Statistics and reports
    GET_STATS: (brandId: number) => `/brand/${brandId}/stats`,
    GET_PAYMENTS: (brandId: number) => `/brand/${brandId}/payments`,
    GET_ACTIVITY: (brandId: number) => `/brand/${brandId}/activity`,
  },
  
  // Schedule management endpoints
  SCHEDULE: {
    BASE: '/schedule',
    
    // Business Hours
    GET_BUSINESS_HOURS: (brandId: number) => `/brand/${brandId}/business-hours`,
    UPDATE_BUSINESS_HOURS: (brandId: number) => `/brand/${brandId}/business-hours`,
    UPDATE_BUSINESS_HOUR: (brandId: number, dayOfWeek: number) => `/brand/${brandId}/business-hours/${dayOfWeek}`,
    
    // Special Hours
    GET_SPECIAL_HOURS: (brandId: number) => `/brand/${brandId}/special-hours`,
    CREATE_SPECIAL_HOUR: (brandId: number) => `/brand/${brandId}/special-hours`,
    UPDATE_SPECIAL_HOUR: (brandId: number, specialHourId: number) => `/brand/${brandId}/special-hours/${specialHourId}`,
    DELETE_SPECIAL_HOUR: (brandId: number, specialHourId: number) => `/brand/${brandId}/special-hours/${specialHourId}`,
    
    // Appointment Settings
    GET_APPOINTMENT_SETTINGS: (brandId: number) => `/brand/${brandId}/appointment-settings`,
    UPDATE_APPOINTMENT_SETTINGS: (brandId: number) => `/brand/${brandId}/appointment-settings`,
    
    // Utilities
    VALIDATE_HOURS: (brandId: number) => `/brand/${brandId}/validate-hours`,
    GET_AVAILABLE_SLOTS: (brandId: number) => `/brand/${brandId}/available-slots`,
  },

  // Appointments endpoints (para el próximo módulo)
  APPOINTMENTS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/appointments`,
    GET_BY_ID: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/appointments`,
    UPDATE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    DELETE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    GET_BY_DATE_RANGE: (brandId: number) => `/brand/${brandId}/appointments/calendar`,
  },

  // Clients endpoints (para el próximo módulo)
  CLIENTS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/clients`,
    GET_BY_ID: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/clients`,
    UPDATE: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    DELETE: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    SEARCH: (brandId: number) => `/brand/${brandId}/clients/search`,
  },

  // Services endpoints (Features como servicios)
  SERVICES: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/services`,
    GET_BY_ID: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/services`,
    UPDATE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    DELETE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
  },
  
  // Validation endpoints
  VALIDATE: {
    EMAIL: '/validate/email',
    USERNAME: '/validate/username',
    PHONE: '/validate/phone',
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE: '/payment/create',
    CALLBACK: '/payment/callback',
    GET_METHODS: '/payment/methods',
  },

  // File upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
    BRAND_LOGO: (brandId: number) => `/brand/${brandId}/upload/logo`,
    BRAND_IMAGES: (brandId: number) => `/brand/${brandId}/upload/images`,
  },
  
  // Health check
  HEALTH: '/health',
} as const;

// Request configuration
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
} as const;

// Environment configuration
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Error codes that should trigger logout
export const LOGOUT_ERROR_CODES = [
  'UNAUTHORIZED',
  'TOKEN_EXPIRED', 
  'TOKEN_INVALID',
  'SESSION_EXPIRED'
] as const;

// Request retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [500, 502, 503, 504],
} as const;

// Query parameters helpers
export const QUERY_PARAMS = {
  PAGINATION: {
    PAGE: 'page',
    LIMIT: 'limit',
    OFFSET: 'offset',
  },
  FILTERING: {
    STATUS: 'status',
    DATE_FROM: 'dateFrom',
    DATE_TO: 'dateTo',
    SEARCH: 'search',
  },
  SORTING: {
    SORT_BY: 'sortBy',
    ORDER: 'order',
  },
} as const;

// Helper function to build URLs with query parameters
export const buildApiUrl = (endpoint: string, params: Record<string, any> = {}): string => {
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString().replace(API_BASE_URL, '');
};
// landing\api\constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
};

// API Endpoints - Consolidated from app/api/config.ts
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
    
    // Brand register process
    REGISTER: '/brand-register',
    UPDATE_REGISTER: (registerId: number) => `/brand-register/${registerId}`,
    GET_REGISTER: (registerId: number) => `/brand-register/${registerId}`,
    GET_REGISTER_BY_EMAIL: (email: string) => `/brand-register/email/${encodeURIComponent(email)}`,
  },

  // Payment endpoints
  PAYMENT: {
    CREATE: '/payment/create',
    CALLBACK: '/payment/callback',
    BRANDS: '/payment/brands',
    GET_BY_ORDER: (orderNumber: string) => `/payment/order/${orderNumber}`,
    GET_BY_ID: (paymentId: number) => `/payment/${paymentId}`,
    GET_METHODS: '/payment/methods',
  },

  // Appointment endpoints
  APPOINTMENTS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/appointments`,
    GET_BY_ID: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/appointments`,
    UPDATE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    DELETE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    GET_BY_DATE_RANGE: (brandId: number) => `/brand/${brandId}/appointments/calendar`,
    CONFIRM: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}/confirm`,
    CANCEL: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}/cancel`,
    COMPLETE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}/complete`,
    GET_BY_DATE: (brandId: number, date: string) => `/brand/${brandId}/appointments/date/${date}`,
    CHECK_CONFLICTS: (brandId: number) => `/brand/${brandId}/appointments/check-conflicts`,
    GET_AVAILABILITY: (brandId: number) => `/brand/${brandId}/appointments/availability`,
  },

  // Client management endpoints
  CLIENTS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/clients`,
    GET_BY_ID: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/clients`,
    UPDATE: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    DELETE: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    SEARCH: (brandId: number) => `/brand/${brandId}/clients/search`,
    GET_APPOINTMENTS: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}/appointments`,
    GET_HISTORY: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}/history`,
  },

  // Schedule endpoints
  SCHEDULE: {
    BASE: (brandId: number) => `/brand/${brandId}/schedule`,
    GET_CONFIG: (brandId: number) => `/brand/${brandId}/schedule/config`,
    UPDATE_CONFIG: (brandId: number) => `/brand/${brandId}/schedule/config`,
    GET_AVAILABILITY: (brandId: number, date?: string) => {
      return date 
        ? `/brand/${brandId}/schedule/availability?date=${date}`
        : `/brand/${brandId}/schedule/availability`;
    },
    // Business hours endpoints
    GET_BUSINESS_HOURS: (brandId: number) => `/brand/${brandId}/business-hours`,
    UPDATE_BUSINESS_HOURS: (brandId: number) => `/brand/${brandId}/business-hours`,
    UPDATE_BUSINESS_HOUR: (brandId: number, dayOfWeek: number) => `/brand/${brandId}/business-hours/${dayOfWeek}`,
    // Special hours endpoints
    GET_SPECIAL_HOURS: (brandId: number) => `/brand/${brandId}/special-hours`,
    CREATE_SPECIAL_HOUR: (brandId: number) => `/brand/${brandId}/special-hours`,
    UPDATE_SPECIAL_HOUR: (brandId: number, specialHourId: number) => `/brand/${brandId}/special-hours/${specialHourId}`,
    DELETE_SPECIAL_HOUR: (brandId: number, specialHourId: number) => `/brand/${brandId}/special-hours/${specialHourId}`,
    // Appointment settings endpoints
    GET_APPOINTMENT_SETTINGS: (brandId: number) => `/brand/${brandId}/appointment-settings`,
    UPDATE_APPOINTMENT_SETTINGS: (brandId: number) => `/brand/${brandId}/appointment-settings`,
    // Validation and utilities
    VALIDATE_HOURS: (brandId: number) => `/brand/${brandId}/validate-hours`,
    GET_AVAILABLE_SLOTS: (brandId: number) => `/brand/${brandId}/available-slots`,
  },

  // Service endpoints
  SERVICES: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/services`,
    GET_BY_ID: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/services`,
    UPDATE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    DELETE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
  },

  // Validation endpoints
  VALIDATION: {
    EMAIL: '/validate/email',
    PHONE: '/validate/phone',
    BRAND_NAME: '/validate/brand-name',
  },

  // Function endpoints
  FUNCTIONS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/functions`,
    GET_BY_ID: (brandId: number, functionId: number) => `/brand/${brandId}/functions/${functionId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/functions`,
    UPDATE: (brandId: number, functionId: number) => `/brand/${brandId}/functions/${functionId}`,
    DELETE: (brandId: number, functionId: number) => `/brand/${brandId}/functions/${functionId}`,
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

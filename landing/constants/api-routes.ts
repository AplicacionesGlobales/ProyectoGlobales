// constants/api-routes.ts

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
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Brand management endpoints
  BRAND: {
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
    
    // Statistics
    GET_STATS: (brandId: number) => `/brand/${brandId}/stats`,
    
    // Payments
    GET_PAYMENTS: (brandId: number) => `/brand/${brandId}/payments`,
    
    // Activity
    GET_ACTIVITY: (brandId: number) => `/brand/${brandId}/activity`,
  },

  // Schedule management endpoints
  SCHEDULE: {
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

  // Appointments endpoints
  APPOINTMENTS: {
    // CRUD operations
    GET_ALL: (brandId: number) => `/brand/${brandId}/appointments`,
    GET_BY_ID: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/appointments`,
    UPDATE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    DELETE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}`,
    
    // Status management
    CONFIRM: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}/confirm`,
    CANCEL: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}/cancel`,
    COMPLETE: (brandId: number, appointmentId: number) => `/brand/${brandId}/appointments/${appointmentId}/complete`,
    
    // Calendar views
    GET_BY_DATE_RANGE: (brandId: number) => `/brand/${brandId}/appointments/calendar`,
    GET_BY_DATE: (brandId: number, date: string) => `/brand/${brandId}/appointments/date/${date}`,
    
    // Conflicts and validation
    CHECK_CONFLICTS: (brandId: number) => `/brand/${brandId}/appointments/check-conflicts`,
    GET_AVAILABILITY: (brandId: number) => `/brand/${brandId}/appointments/availability`,
  },

  // Clients endpoints
  CLIENTS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/clients`,
    GET_BY_ID: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/clients`,
    UPDATE: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    DELETE: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}`,
    
    // Client history
    GET_APPOINTMENTS: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}/appointments`,
    GET_HISTORY: (brandId: number, clientId: number) => `/brand/${brandId}/clients/${clientId}/history`,
    
    // Search
    SEARCH: (brandId: number) => `/brand/${brandId}/clients/search`,
  },

  // Services endpoints (Features used as services)
  SERVICES: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/services`,
    GET_BY_ID: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    CREATE: (brandId: number) => `/brand/${brandId}/services`,
    UPDATE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    DELETE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}`,
    
    // Service configuration
    UPDATE_DURATION: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}/duration`,
    UPDATE_PRICE: (brandId: number, serviceId: number) => `/brand/${brandId}/services/${serviceId}/price`,
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    GET_ALL: (brandId: number) => `/brand/${brandId}/notifications`,
    MARK_READ: (brandId: number, notificationId: number) => `/brand/${brandId}/notifications/${notificationId}/read`,
    MARK_ALL_READ: (brandId: number) => `/brand/${brandId}/notifications/mark-all-read`,
    GET_SETTINGS: (brandId: number) => `/brand/${brandId}/notification-settings`,
    UPDATE_SETTINGS: (brandId: number) => `/brand/${brandId}/notification-settings`,
  },

  // Reports endpoints
  REPORTS: {
    DASHBOARD_STATS: (brandId: number) => `/brand/${brandId}/reports/dashboard`,
    APPOINTMENTS_SUMMARY: (brandId: number) => `/brand/${brandId}/reports/appointments`,
    REVENUE_SUMMARY: (brandId: number) => `/brand/${brandId}/reports/revenue`,
    CLIENT_ANALYTICS: (brandId: number) => `/brand/${brandId}/reports/clients`,
    SERVICE_ANALYTICS: (brandId: number) => `/brand/${brandId}/reports/services`,
    EXPORT_DATA: (brandId: number) => `/brand/${brandId}/reports/export`,
  },

  // Validation endpoints
  VALIDATION: {
    EMAIL: '/validate/email',
    USERNAME: '/validate/username',
    PHONE: '/validate/phone',
    APPOINTMENT_TIME: (brandId: number) => `/brand/${brandId}/validate/appointment-time`,
  },

  // Payment endpoints
  PAYMENT: {
    CREATE: '/payment/create',
    CALLBACK: '/payment/callback',
    GET_METHODS: '/payment/methods',
    PROCESS: '/payment/process',
  },

  // File upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
    BRAND_LOGO: (brandId: number) => `/brand/${brandId}/upload/logo`,
    BRAND_IMAGES: (brandId: number) => `/brand/${brandId}/upload/images`,
    PROFILE_PICTURE: '/upload/profile-picture',
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
  LONG_POLLING: {
    timeout: 60000, // 1 minute for long polling
  },
} as const;

// HTTP status codes for reference
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common query parameters
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
    CATEGORY: 'category',
  },
  SORTING: {
    SORT_BY: 'sortBy',
    ORDER: 'order',
  },
  CALENDAR: {
    START_DATE: 'startDate',
    END_DATE: 'endDate',
    VIEW: 'view', // day, week, month
  },
} as const;

// Helper functions for building URLs with query parameters
export const urlHelpers = {
  // Build URL with query parameters
  buildUrl: (baseUrl: string, params: Record<string, any> = {}): string => {
    const url = new URL(baseUrl, API_CONFIG.BASE_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString().replace(API_CONFIG.BASE_URL, '');
  },

  // Build pagination URL
  buildPaginationUrl: (baseUrl: string, page: number, limit: number): string => {
    return urlHelpers.buildUrl(baseUrl, {
      [QUERY_PARAMS.PAGINATION.PAGE]: page,
      [QUERY_PARAMS.PAGINATION.LIMIT]: limit,
    });
  },

  // Build date range URL
  buildDateRangeUrl: (baseUrl: string, startDate: string, endDate: string): string => {
    return urlHelpers.buildUrl(baseUrl, {
      [QUERY_PARAMS.FILTERING.DATE_FROM]: startDate,
      [QUERY_PARAMS.FILTERING.DATE_TO]: endDate,
    });
  },

  // Build search URL
  buildSearchUrl: (baseUrl: string, searchTerm: string, page: number = 1, limit: number = 10): string => {
    return urlHelpers.buildUrl(baseUrl, {
      [QUERY_PARAMS.FILTERING.SEARCH]: searchTerm,
      [QUERY_PARAMS.PAGINATION.PAGE]: page,
      [QUERY_PARAMS.PAGINATION.LIMIT]: limit,
    });
  },
};
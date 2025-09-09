import { API_BASE_URL } from '../config/api';

// API Constants - Rutas de los endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register/client',
    LOGIN: '/auth/login',
    GOOGLE_VALIDATE: '/auth/google/validate',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VALIDATE_RESET_CODE: '/auth/validate-reset-code',
    RESET_PASSWORD: '/auth/reset-password',
  },
  COLOR_PALETTES: {
    BY_BRAND: '/color-palettes/brand',
    VALIDATE: '/color-palettes/validate',
    UPSERT: '/color-palettes/brand/{brandId}/upsert',
  },
  // Validation endpoints
  VALIDATE: {
    EMAIL: '/validate/email',
    USERNAME: '/validate/username',
  },
  // Brand endpoints
  BRANDS: {
    BY_ID: '/brands',
  },
  // Brand Images endpoints
  BRAND_IMAGES: {
    BY_BRAND: '/files/brand',
  },
  SERVICE_TYPES: {
    BY_ID: '/brand/{brandId}',
  },
  APPOINTMENTS: {
    CREATE: '/brand/{brandId}',
    CALENDAR: '/brand/{brandId}/appointments/calendar',
    DAY_AGENDA: '/brand/{brandId}/calendar/today/agenda',
    DATE_AGENDA: '/brand/{brandId}/calendar/date/{date}/agenda',
  },
  CALENDAR: {
    MONTH: '/brand/{brandId}/calendar/month/{month}',
    WEEK: '/brand/{brandId}/appointments/calendar', // Using existing with date range
    BUSINESS_HOURS: '/brand/{brandId}/business-hours',
    SPECIAL_HOURS: '/brand/{brandId}/special-hours',
    APPOINTMENT_SETTINGS: '/brand/{brandId}/appointment-settings',
  }

} as const;

// Base URL (ajusta según tu servidor)
export const BASE_URL = API_BASE_URL;
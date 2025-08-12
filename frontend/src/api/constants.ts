import { API_BASE_URL } from '../config/api';

// API Constants - Rutas de los endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register/client',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VALIDATE_RESET_CODE: '/auth/validate-reset-code',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // Validation endpoints
  VALIDATE: {
    EMAIL: '/validate/email',
    USERNAME: '/validate/username',
  },
} as const;

// Base URL (ajusta según tu servidor)
export const BASE_URL = API_BASE_URL;
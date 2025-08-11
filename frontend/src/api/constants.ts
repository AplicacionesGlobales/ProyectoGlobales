// API Constants - Rutas de los endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VALIDATE_EMAIL: '/auth/validate-email',
    VALIDATE_USERNAME: '/auth/validate-username',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
} as const;

// Base URL (ajusta según tu servidor)
export const BASE_URL = 'https://748q43kg-3000.use2.devtunnels.ms';

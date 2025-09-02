// URL base del servidor API
// Usar DEV para desarrollo local, cambiar a PROD para producción
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL_DEV || process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'http://localhost:3000';

console.log('🌐 API_BASE_URL configurada como:', API_BASE_URL);




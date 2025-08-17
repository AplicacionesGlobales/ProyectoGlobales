/**
 * Configuración centralizada de la API
 */

// URL base del servidor API
export const API_BASE_URL = process.env.API_BASE_URL_PROD;

// Para desarrollo local, descomenta esta línea:
// export const API_BASE_URL = 'http://localhost:3000';

/**
 * Configuración por ambiente
 */
export const API_CONFIG = {
    development: {
        baseURL: process.env.API_BASE_URL_DEV,
        timeout: Number(process.env.API_TIMEOUT_DEV),
    },
    production: {
        baseURL: process.env.API_BASE_URL_PROD,
        timeout: Number(process.env.API_TIMEOUT_PROD),
    }
};


// Detectar ambiente
const isDevelopment = __DEV__; // en React Native/Expo
// const isDevelopment = process.env.NODE_ENV !== 'production'; // en Node

export const currentConfig = isDevelopment
    ? API_CONFIG.development
    : API_CONFIG.production;

/**
 * Configuración centralizada de la API
 */

// URL base del servidor API
export const API_BASE_URL = 'https://qzfvs69v-3000.use2.devtunnels.ms';

// Para desarrollo local, descomenta esta línea:
// export const API_BASE_URL = 'http://localhost:3000';

/**
 * Configuración por ambiente
 */
export const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:3000',
        timeout: 10000,
    },
    production: {
        baseURL: 'https://qzfvs69v-3000.use2.devtunnels.ms',
        timeout: 15000,
    }
};

// Detectar ambiente (puedes usar NODE_ENV o expo constants)
const isDevelopment = __DEV__;
export const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

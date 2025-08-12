import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Almacenamiento seguro multiplataforma para tokens
 * - iOS/Android: AsyncStorage (SecureStore disponible como upgrade futuro)
 * - Web: localStorage para tokens perpetuos, sessionStorage para temporales
 */

interface StorageStrategy {
    setItem: (key: string, value: string) => Promise<void>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
}

class SecureStorage {
    private persistentStorage: StorageStrategy;
    private sessionStorage: StorageStrategy;

    constructor() {
        if (Platform.OS === 'web') {
            // Web: localStorage para persistencia, sessionStorage para sesiones temporales
            this.persistentStorage = {
                setItem: async (key: string, value: string) => {
                    localStorage.setItem(key, value);
                },
                getItem: async (key: string) => {
                    return localStorage.getItem(key);
                },
                removeItem: async (key: string) => {
                    localStorage.removeItem(key);
                },
                clear: async () => {
                    // Solo limpiar keys relacionadas con auth
                    const keysToRemove = ['access_token', 'refresh_token', 'remember_me', 'user_data'];
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                }
            };

            this.sessionStorage = {
                setItem: async (key: string, value: string) => {
                    sessionStorage.setItem(key, value);
                },
                getItem: async (key: string) => {
                    return sessionStorage.getItem(key);
                },
                removeItem: async (key: string) => {
                    sessionStorage.removeItem(key);
                },
                clear: async () => {
                    const keysToRemove = ['access_token', 'user_data'];
                    keysToRemove.forEach(key => sessionStorage.removeItem(key));
                }
            };
        } else {
            // Mobile: AsyncStorage para todo (upgrade futuro a SecureStore)
            this.persistentStorage = AsyncStorage;
            this.sessionStorage = AsyncStorage; // Mismo storage, diferente gestión
        }
    }

    /**
     * Almacenar access token según el tipo de sesión
     */
    async storeAccessToken(token: string, rememberMe: boolean = false): Promise<void> {
        const storage = rememberMe ? this.persistentStorage : this.sessionStorage;
        await storage.setItem('access_token', token);
    }

    /**
     * Almacenar refresh token (siempre persistente cuando existe)
     */
    async storeRefreshToken(token: string): Promise<void> {
        await this.persistentStorage.setItem('refresh_token', token);
    }

    /**
     * Almacenar preferencia de "recordar sesión"
     */
    async storeRememberMe(remember: boolean): Promise<void> {
        await this.persistentStorage.setItem('remember_me', remember.toString());
    }

    /**
     * Almacenar datos del usuario
     */
    async storeUserData(userData: any, rememberMe: boolean = false): Promise<void> {
        const storage = rememberMe ? this.persistentStorage : this.sessionStorage;
        await storage.setItem('user_data', JSON.stringify(userData));
    }

    /**
     * Obtener access token
     */
    async getAccessToken(): Promise<string | null> {
        // Intentar primero en persistent, luego en session
        let token = await this.persistentStorage.getItem('access_token');
        if (!token && Platform.OS === 'web') {
            token = await this.sessionStorage.getItem('access_token');
        }
        return token;
    }

    /**
     * Obtener refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        return await this.persistentStorage.getItem('refresh_token');
    }

    /**
     * Obtener preferencia de "recordar sesión"
     */
    async getRememberMe(): Promise<boolean> {
        const remember = await this.persistentStorage.getItem('remember_me');
        return remember === 'true';
    }

    /**
     * Obtener datos del usuario
     */
    async getUserData(): Promise<any | null> {
        // Intentar primero en persistent, luego en session
        let userData = await this.persistentStorage.getItem('user_data');
        if (!userData && Platform.OS === 'web') {
            userData = await this.sessionStorage.getItem('user_data');
        }

        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Verificar si tiene refresh token (sesión persistente)
     */
    async hasRefreshToken(): Promise<boolean> {
        const refreshToken = await this.getRefreshToken();
        return !!refreshToken;
    }

    /**
     * Limpiar todos los tokens y datos (logout completo)
     */
    async clearAll(): Promise<void> {
        await Promise.all([
            this.persistentStorage.removeItem('access_token'),
            this.persistentStorage.removeItem('refresh_token'),
            this.persistentStorage.removeItem('remember_me'),
            this.persistentStorage.removeItem('user_data'),
        ]);

        // Limpiar también session storage en web
        if (Platform.OS === 'web') {
            await Promise.all([
                this.sessionStorage.removeItem('access_token'),
                this.sessionStorage.removeItem('user_data'),
            ]);
        }
    }

    /**
     * Limpiar solo tokens de acceso (mantener refresh si existe)
     */
    async clearAccessToken(): Promise<void> {
        await this.persistentStorage.removeItem('access_token');
        if (Platform.OS === 'web') {
            await this.sessionStorage.removeItem('access_token');
        }
    }

    /**
     * Obtener información de debug del almacenamiento
     */
    async getStorageInfo(): Promise<{
        hasAccessToken: boolean;
        hasRefreshToken: boolean;
        rememberMe: boolean;
        hasUserData: boolean;
    }> {
        const [accessToken, refreshToken, rememberMe, userData] = await Promise.all([
            this.getAccessToken(),
            this.getRefreshToken(),
            this.getRememberMe(),
            this.getUserData(),
        ]);

        return {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            rememberMe,
            hasUserData: !!userData,
        };
    }
}

// Instancia singleton
export const secureStorage = new SecureStorage();

// Utilidades adicionales
export const TokenUtils = {
    /**
     * Decodificar payload del JWT (sin verificar signature)
     */
    decodeToken: (token: string): any => {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    },

    /**
     * Verificar si el token está cerca de expirar (menos de 1 hora)
     */
    isTokenNearExpiry: (token: string): boolean => {
        try {
            const payload = TokenUtils.decodeToken(token);
            if (!payload || !payload.exp) return true;

            const now = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - now;

            // Considerar "cerca de expirar" si faltan menos de 1 hora (3600 segundos)
            return timeUntilExpiry < 3600;
        } catch (error) {
            return true;
        }
    },

    /**
     * Obtener tiempo restante del token en segundos
     */
    getTokenRemainingTime: (token: string): number => {
        try {
            const payload = TokenUtils.decodeToken(token);
            if (!payload || !payload.exp) return 0;

            const now = Date.now() / 1000;
            return Math.max(0, payload.exp - now);
        } catch (error) {
            return 0;
        }
    }
};

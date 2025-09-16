import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { GoogleSignInResult } from './googleAuth.native.service';
import { googleAuthWebService } from './googleAuth.web.service';

// Detectar si estamos en Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Función que retorna el servicio correcto según la plataforma
export const getGoogleAuthService = () => {
    if (Platform.OS === 'web') {
        return googleAuthWebService;
    }
    
    // Solo importar el servicio nativo si NO estamos en Expo Go
    if (!isExpoGo) {
        const { googleAuthNativeService } = require('./googleAuth.native.service');
        return googleAuthNativeService;
    }
    
    return null;
};

// Servicio unificado
export const googleAuthService = {
    async signIn(): Promise<GoogleSignInResult> {
        // Prevenir el crash en Expo Go para plataformas móviles
        if (Platform.OS !== 'web' && isExpoGo) {
            console.warn('Google Sign-In no disponible en Expo Go');
            return { 
                success: false, 
                error: 'Google Sign-In requiere Development Build. Usa la versión web o compila con "npx expo run:android"' 
            };
        }

        const service = getGoogleAuthService();
        if (!service) {
            return { 
                success: false, 
                error: 'Servicio de Google no disponible' 
            };
        }
        
        return service.signIn();
    },

    async signOut(): Promise<void> {
        if (Platform.OS !== 'web' && isExpoGo) {
            return;
        }

        const service = getGoogleAuthService();
        if (service) {
            return service.signOut();
        }
    },

    async isSignedIn(): Promise<boolean> {
        if (Platform.OS !== 'web' && isExpoGo) {
            return false;
        }

        const service = getGoogleAuthService();
        if (!service) {
            return false;
        }
        
        return service.isSignedIn();
    }
};

// También exportar los tipos
export type { GoogleSignInResult };
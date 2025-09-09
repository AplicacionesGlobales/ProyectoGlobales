import { Platform } from 'react-native';
import { googleAuthNativeService, GoogleSignInResult } from './googleAuth.native.service';
import { googleAuthWebService } from './googleAuth.web.service';

// Función que retorna el servicio correcto según la plataforma
export const getGoogleAuthService = () => {
    if (Platform.OS === 'web') {
        return googleAuthWebService;
    }
    return googleAuthNativeService;
};

// Servicio unificado
export const googleAuthService = {
    async signIn(): Promise<GoogleSignInResult> {
        const service = getGoogleAuthService();
        return service.signIn();
    },

    async signOut(): Promise<void> {
        const service = getGoogleAuthService();
        return service.signOut();
    },

    async isSignedIn(): Promise<boolean> {
        const service = getGoogleAuthService();
        return service.isSignedIn();
    }
};

// También exportar los tipos
export type { GoogleSignInResult };

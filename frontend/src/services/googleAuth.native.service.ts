import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthConfig } from '../config/googleAuth.config';

export interface GoogleSignInResult {
    success: boolean;
    idToken?: string;
    user?: {
        email: string;
        name: string;
        photo?: string;
        familyName?: string;
        givenName?: string;
    };
    error?: string;
}

class GoogleAuthNativeService {
    private isConfigured = false;

    constructor() {
        this.configure();
    }

    private configure(): void {
        try {
            GoogleSignin.configure({
                webClientId: GoogleAuthConfig.webClientId,
                offlineAccess: true,
                forceCodeForRefreshToken: true,
                iosClientId: GoogleAuthConfig.iosClientId,
                profileImageSize: 120,
            });

            this.isConfigured = true;
            console.log('✅ Google Sign-In configurado correctamente');
        } catch (error) {
            console.error('❌ Error configurando Google Sign-In:', error);
        }
    }

    async signIn(): Promise<GoogleSignInResult> {
        try {
            if (!this.isConfigured) {
                this.configure();
            }

            console.log('🔍 Iniciando Google Sign-In...');

            // Verificar si Google Play Services están disponibles (Android)
            await GoogleSignin.hasPlayServices();

            // Realizar sign in
            const userInfo = await GoogleSignin.signIn();

            console.log('✅ Google Sign-In exitoso');
            console.log('📧 Email:', userInfo.data?.user.email);
            console.log('👤 Nombre:', userInfo.data?.user.name);

            // Obtener ID Token
            const tokens = await GoogleSignin.getTokens();

            return {
                success: true,
                idToken: tokens.idToken,
                user: {
                    email: userInfo.data?.user.email || '',
                    name: userInfo.data?.user.name || '',
                    photo: userInfo.data?.user.photo || undefined,
                    familyName: userInfo.data?.user.familyName || undefined,
                    givenName: userInfo.data?.user.givenName || undefined,
                }
            };

        } catch (error: any) {
            console.error('❌ Error en Google Sign-In:', error);

            let errorMessage = 'Error desconocido en Google Sign-In';

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                errorMessage = 'Sign-in cancelado por el usuario';
            } else if (error.code === statusCodes.IN_PROGRESS) {
                errorMessage = 'Sign-in en progreso';
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                errorMessage = 'Google Play Services no disponible';
            } else {
                errorMessage = error.message || errorMessage;
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async signOut(): Promise<void> {
        try {
            await GoogleSignin.signOut();
            console.log('✅ Google Sign-Out exitoso');
        } catch (error) {
            console.error('❌ Error en Google Sign-Out:', error);
        }
    }

    async isSignedIn(): Promise<boolean> {
        try {
            const currentUser = await GoogleSignin.getCurrentUser();
            return currentUser !== null;
        } catch (error) {
            return false;
        }
    }

    async getCurrentUser(): Promise<any> {
        try {
            return await GoogleSignin.getCurrentUser();
        } catch (error) {
            return null;
        }
    }
}

export const googleAuthNativeService = new GoogleAuthNativeService();

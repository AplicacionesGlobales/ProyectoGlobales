import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthConfig, getGoogleClientId } from '../config/googleAuth.config';
import { Platform } from 'react-native';

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
            const config: any = {
                webClientId: GoogleAuthConfig.webClientId, // ✅ Siempre usar webClientId
                offlineAccess: true,
                forceCodeForRefreshToken: true,
                profileImageSize: 120,
            };

            // Solo agregar iosClientId si está en iOS y es diferente
            if (Platform.OS === 'ios' &&
                GoogleAuthConfig.iosClientId &&
                GoogleAuthConfig.iosClientId !== GoogleAuthConfig.webClientId) {
                config.iosClientId = GoogleAuthConfig.iosClientId;
            }

            GoogleSignin.configure(config);

            this.isConfigured = true;
            console.log('✅ Google Sign-In configurado correctamente');
            console.log('🔧 Config utilizada:', {
                platform: Platform.OS,
                webClientId: GoogleAuthConfig.webClientId?.substring(0, 20) + '...', // ✅ Usar GoogleAuthConfig.webClientId
                hasIosClientId: !!config.iosClientId,
                offlineAccess: config.offlineAccess
            });
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
            console.log('📱 Verificando Google Play Services...');

            // Verificar si Google Play Services están disponibles (Android)
            await GoogleSignin.hasPlayServices();
            console.log('✅ Google Play Services disponibles');

            console.log('🔐 Iniciando proceso de autenticación...');
            // Realizar sign in
            const userInfo = await GoogleSignin.signIn();

            console.log('✅ Google Sign-In exitoso');
            console.log('📧 Email:', userInfo.data?.user.email);
            console.log('👤 Nombre:', userInfo.data?.user.name);
            console.log('🔑 ID Token disponible:', !!userInfo.data?.idToken);

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
            console.error('🔍 Error code:', error.code);
            console.error('🔍 Error message:', error.message);
            console.error('🔍 Error details:', error);

            let errorMessage = 'Error desconocido en Google Sign-In';

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                errorMessage = 'Sign-in cancelado por el usuario';
            } else if (error.code === statusCodes.IN_PROGRESS) {
                errorMessage = 'Sign-in en progreso';
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                errorMessage = 'Google Play Services no disponible';
            } else if (error.message?.includes('DEVELOPER_ERROR')) {
                errorMessage = 'DEVELOPER_ERROR: Necesitas crear un Client ID específico para Android en Google Console. SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';
                console.error('🚨 SOLUCIÓN: Ve a SOLUCION_DEVELOPER_ERROR.md para instrucciones completas');
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

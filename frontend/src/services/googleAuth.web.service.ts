// googleAuth.web.service.ts
declare global {
    interface Window {
        google: any;
    }
}

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

class GoogleAuthWebService {
    private isInitialized = false;
    private scriptLoaded = false;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Cargar script de Google
            await this.loadGoogleScript();

            // Verificar que Google esté disponible
            if (!window.google?.accounts?.id) {
                throw new Error('Google Identity Services no se cargó correctamente');
            }

            this.isInitialized = true;
            console.log('✅ Google Auth Web inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Google Auth Web:', error);
            throw error;
        }
    }

    private loadGoogleScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.scriptLoaded && window.google) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                this.scriptLoaded = true;
                // Esperar un poco a que Google se inicialice completamente
                setTimeout(() => resolve(), 100);
            };

            script.onerror = () => {
                reject(new Error('Error cargando Google Identity Services'));
            };

            document.head.appendChild(script);
        });
    }

    async signIn(): Promise<GoogleSignInResult> {
        try {
            console.log('🔍 Iniciando Google Sign-In Web...');

            await this.initialize();

            return new Promise((resolve) => {
                window.google.accounts.id.initialize({
                    client_id: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '669086356546-s09o10kfj8hnhur1042l3kbvm158j0i7.apps.googleusercontent.com',
                    callback: (response: any) => {
                        try {
                            console.log('✅ Google Sign-In Web exitoso');

                            // Decodificar el JWT para obtener información del usuario
                            const payload = this.decodeJWT(response.credential);

                            resolve({
                                success: true,
                                idToken: response.credential,
                                user: {
                                    email: payload.email,
                                    name: payload.name,
                                    photo: payload.picture,
                                    familyName: payload.family_name,
                                    givenName: payload.given_name,
                                }
                            });
                        } catch (error) {
                            console.error('❌ Error procesando respuesta de Google:', error);
                            resolve({
                                success: false,
                                error: 'Error procesando respuesta de Google'
                            });
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true
                });

                // Usar directamente el botón en lugar del prompt automático
                console.log('🔧 Usando botón de Google Sign-In (más confiable que prompt automático)');
                this.renderButton().then((result) => {
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('❌ Error en Google Sign-In Web:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido en Google Sign-In Web'
            };
        }
    } private renderButton(): Promise<GoogleSignInResult> {
        return new Promise((resolve) => {
            // Crear elemento temporal para el botón si no existe
            let buttonContainer = document.getElementById('temp-google-signin-button');
            if (!buttonContainer) {
                buttonContainer = document.createElement('div');
                buttonContainer.id = 'temp-google-signin-button';
                buttonContainer.style.position = 'fixed';
                buttonContainer.style.top = '50%';
                buttonContainer.style.left = '50%';
                buttonContainer.style.transform = 'translate(-50%, -50%)';
                buttonContainer.style.zIndex = '10000';
                buttonContainer.style.backgroundColor = 'white';
                buttonContainer.style.padding = '20px';
                buttonContainer.style.borderRadius = '8px';
                buttonContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                document.body.appendChild(buttonContainer);
            }

            window.google.accounts.id.renderButton(buttonContainer, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            });

            // Agregar overlay para cerrar
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '9999';
            overlay.onclick = () => {
                document.body.removeChild(overlay);
                document.body.removeChild(buttonContainer!);
                resolve({
                    success: false,
                    error: 'Sign-in cancelado por el usuario'
                });
            };

            document.body.appendChild(overlay);
        });
    }

    private decodeJWT(token: string): any {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Error decodificando JWT:', error);
            return {};
        }
    }

    async signOut(): Promise<void> {
        try {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.disableAutoSelect();
            }
            console.log('✅ Google Sign-Out Web exitoso');
        } catch (error) {
            console.error('❌ Error en Google Sign-Out Web:', error);
        }
    }

    async isSignedIn(): Promise<boolean> {
        // En web, no mantenemos estado de sesión de Google
        return false;
    }
}

export const googleAuthWebService = new GoogleAuthWebService();

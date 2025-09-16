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

                // Detectar si estamos en móvil o tunnel para usar botón directo
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isDevTunnel = window.location.hostname.includes('devtunnels.ms');
                
                if (isMobile || isDevTunnel) {
                    console.log('🔧 Detectado móvil/tunnel, usando botón directo...');
                    this.createInlineButton().then(resolve);
                } else {
                    // Intentar prompt solo en desktop local
                    console.log('🔧 Intentando prompt de Google Sign-In...');
                    try {
                        window.google.accounts.id.prompt((notification: any) => {
                            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                                console.log('📋 Prompt no disponible, usando botón directo...');
                                this.createInlineButton().then(resolve);
                            }
                        });
                    } catch (error) {
                        console.log('📋 Error con prompt, usando botón directo...');
                        this.createInlineButton().then(resolve);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error en Google Sign-In Web:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido en Google Sign-In Web'
            };
        }
    }

    private createInlineButton(): Promise<GoogleSignInResult> {
        return new Promise((resolve) => {
            // Crear un contenedor temporal pero sin modal/overlay
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.top = '-9999px'; // Oculto fuera de la pantalla
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = '200px';
            tempContainer.style.height = '50px';
            document.body.appendChild(tempContainer);

            // Renderizar el botón de Google
            window.google.accounts.id.renderButton(tempContainer, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            });

            // Intentar múltiples formas de encontrar y hacer clic en el botón
            const tryClickButton = () => {
                // Método 1: Buscar por role="button"
                let googleButton = tempContainer.querySelector('div[role="button"]') as HTMLElement;
                
                // Método 2: Buscar por cualquier div clickeable
                if (!googleButton) {
                    googleButton = tempContainer.querySelector('div[tabindex]') as HTMLElement;
                }
                
                // Método 3: Buscar primer div con eventos
                if (!googleButton) {
                    googleButton = tempContainer.querySelector('div') as HTMLElement;
                }

                if (googleButton) {
                    console.log('🔄 Ejecutando sign-in automático...');
                    
                    // Múltiples formas de activar el botón
                    googleButton.click();
                    
                    // Fallback: disparar eventos manualmente
                    setTimeout(() => {
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        googleButton.dispatchEvent(clickEvent);
                    }, 50);
                    
                } else {
                    console.error('❌ No se pudo encontrar el botón de Google');
                    document.body.removeChild(tempContainer);
                    resolve({
                        success: false,
                        error: 'No se pudo inicializar Google Sign-In'
                    });
                }
            };

            // Esperar más tiempo en móviles para que el botón se renderice
            const waitTime = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 500 : 200;
            
            setTimeout(tryClickButton, waitTime);

            // Limpiar después de un tiempo
            setTimeout(() => {
                if (document.body.contains(tempContainer)) {
                    document.body.removeChild(tempContainer);
                }
            }, 10000);
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

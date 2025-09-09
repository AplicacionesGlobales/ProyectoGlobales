import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    googleId: string;
}

@Injectable()
export class GoogleAuthService {
    private client: OAuth2Client;
    private clientIds: string[];

    constructor(private configService: ConfigService) {
        const webClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

        // Client IDs válidos (web y Android)
        this.clientIds = [
            '669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com', // Android Client ID
            '669086356546-s09o10kfj8hnhur1042l3kbvm158j0i7.apps.googleusercontent.com'  // Web Client ID
        ];

        console.log('🔧 Google Auth configurado con Client IDs:', this.clientIds.map(id => id.substring(0, 20) + '...'));

        this.client = new OAuth2Client(webClientId);
    }

    async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
        try {
            console.log('🔍 Verificando Google ID Token...');

            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: this.clientIds, // Aceptar múltiples Client IDs
            });

            const payload = ticket.getPayload();

            if (!payload) {
                console.log('❌ Token payload vacío');
                return null;
            }

            console.log('✅ Token verificado exitosamente');
            console.log('📧 Email:', payload.email);
            console.log('👤 Nombre:', payload.given_name, payload.family_name);
            console.log('🎯 Audience usado:', payload.aud);

            return {
                email: payload.email!,
                firstName: payload.given_name || '',
                lastName: payload.family_name || '',
                picture: payload.picture,
                googleId: payload.sub,
            };
        } catch (error) {
            console.error('❌ Error verificando ID Token:', error);
            console.error('🔍 Client IDs configurados:', this.clientIds);
            return null;
        }
    }
}

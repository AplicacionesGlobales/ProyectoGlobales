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

    constructor(private configService: ConfigService) {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        this.client = new OAuth2Client(clientId);
    }

    async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
        try {
            console.log('🔍 Verificando Google ID Token...');

            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();

            if (!payload) {
                console.log('❌ Token payload vacío');
                return null;
            }

            console.log('✅ Token verificado exitosamente');
            console.log('📧 Email:', payload.email);
            console.log('👤 Nombre:', payload.given_name, payload.family_name);

            return {
                email: payload.email!,
                firstName: payload.given_name || '',
                lastName: payload.family_name || '',
                picture: payload.picture,
                googleId: payload.sub,
            };
        } catch (error) {
            console.error('❌ Error verificando ID Token:', error);
            return null;
        }
    }
}

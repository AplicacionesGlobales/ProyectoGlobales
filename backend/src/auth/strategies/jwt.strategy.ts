import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'default-secret-key',
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.userId,
            userBrandId: payload.userBrandId,
            brandId: payload.brandId,
            email: payload.email,
            username: payload.username,
            role: payload.role
        };
    }
}

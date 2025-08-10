// common/services/crypto.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export interface ResetTokenPayload {
  userId: number;
  email: string;
  tokenId: string;
}

@Injectable()
export class CryptoService {
  constructor(private readonly jwtService: JwtService) {}

  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  createJWTToken(payload: ResetTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_RESET || process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }

  verifyJWTToken(token: string): ResetTokenPayload | null {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_RESET || process.env.JWT_SECRET,
      }) as ResetTokenPayload;
    } catch (error) {
      console.error('Error verificando JWT token:', error);
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
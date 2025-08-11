// common/services/crypto.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  constructor(private readonly jwtService: JwtService) {}

  // Genera un código de 6 dígitos para reset de contraseña
  generateResetCode(): string {
    // Genera un número aleatorio de 6 dígitos (100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
  }

  // Método legacy mantenido por compatibilidad si se necesita
  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
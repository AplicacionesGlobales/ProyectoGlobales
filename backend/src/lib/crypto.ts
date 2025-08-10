// lib/crypto.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export interface ResetTokenPayload {
  userId: string;
  email: string;
  tokenId: string;
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function createJWTToken(payload: ResetTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET_RESET!, {
    expiresIn: '1h', // Token expira en 1 hora
  });
}

export function verifyJWTToken(token: string): ResetTokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_RESET!) as ResetTokenPayload;
  } catch (error) {
    console.error('Error verificando JWT token:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
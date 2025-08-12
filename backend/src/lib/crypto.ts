// lib/crypto.ts
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export interface ResetTokenPayload {
  userId: string;
  email: string;
  tokenId: string;
}

export interface AccessTokenPayload {
  userId: number;
  userBrandId?: number;
  brandId?: number;
  email: string;
  username: string;
  role: string;
  type: 'access_token';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  userBrandId?: number;
  brandId?: number;
  email: string;
  username: string;
  role: string;
  type: 'refresh_token';
  tokenId: string; // ID único para invalidar tokens específicos
  iat?: number;
  // NO incluye 'exp' - token sin expiración
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenId(): string {
  return randomBytes(16).toString('hex') + '_' + Date.now();
}

export function createJWTToken(payload: ResetTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET_RESET!, {
    expiresIn: '1h', // Token expira en 1 hora
  });
}

export function createAccessToken(payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>): string {
  const tokenPayload: AccessTokenPayload = {
    ...payload,
    type: 'access_token'
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: '8h' // Access tokens duran 8 horas
  });
}

export function createRefreshToken(payload: Omit<RefreshTokenPayload, 'type' | 'tokenId' | 'iat'>): string {
  const tokenPayload: RefreshTokenPayload = {
    ...payload,
    type: 'refresh_token',
    tokenId: generateTokenId()
  };

  // Refresh tokens SIN expiresIn - indefinidos
  return jwt.sign(tokenPayload, process.env.JWT_SECRET!);
}

export function verifyJWTToken(token: string): ResetTokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_RESET!) as ResetTokenPayload;
  } catch (error) {
    console.error('Error verificando JWT token:', error);
    return null;
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
    return payload.type === 'access_token' ? payload : null;
  } catch (error) {
    console.error('Error verificando access token:', error);
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as RefreshTokenPayload;
    return payload.type === 'refresh_token' ? payload : null;
  } catch (error) {
    console.error('Error verificando refresh token:', error);
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
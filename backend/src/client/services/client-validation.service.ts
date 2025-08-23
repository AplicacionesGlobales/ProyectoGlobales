// client/services/client-validation.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientValidationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que el email no esté en uso para un brand específico
   * Un mismo email puede estar en diferentes brands
   * @param email Email a validar
   * @param brandId ID del brand
   * @returns Promise<{ isAvailable: boolean, existingClient?: any }>
   */
  async validateEmailForBrand(email: string, brandId: number): Promise<{
    isAvailable: boolean;
    existingClient?: any;
  }> {
    // Buscar si existe un usuario con ese email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userBrands: {
          where: { brandId },
          select: {
            id: true,
            isActive: true,
          }
        }
      }
    });

    if (!existingUser) {
      return { isAvailable: true };
    }

    // Si existe el usuario pero no está asociado a este brand
    if (existingUser.userBrands.length === 0) {
      return { 
        isAvailable: true,
        existingClient: existingUser 
      };
    }

    // Si ya está asociado al brand
    return {
      isAvailable: false,
      existingClient: {
        ...existingUser,
        isActive: existingUser.userBrands[0].isActive
      }
    };
  }

  /**
   * Valida que el usuario tenga permisos sobre el brand
   * @param userId ID del usuario
   * @param brandId ID del brand
   * @returns Promise<boolean>
   */
  async validateBrandOwnership(userId: number, brandId: number): Promise<boolean> {
    // Verificar si es dueño del brand
    const brand = await this.prisma.brand.findFirst({
      where: {
        id: brandId,
        ownerId: userId
      }
    });

    if (brand) {
      return true;
    }

    // Verificar si es ADMIN del brand
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        userId,
        brandId,
        isActive: true
      },
      include: {
        user: {
          select: {
            role: true
          }
        }
      }
    });

    return userBrand?.user.role === 'ADMIN';
  }

  /**
   * Valida formato de teléfono internacional
   * @param phone Número de teléfono
   * @returns boolean
   */
  validatePhoneFormat(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Genera un username único basado en el email
   * @param email Email del cliente
   * @returns Promise<string>
   */
  async generateUniqueUsername(email: string): Promise<string> {
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let suffix = 0;
    let isUnique = false;

    while (!isUnique) {
      const checkUsername = suffix === 0 ? username : `${username}${suffix}`;
      const existing = await this.prisma.user.findUnique({
        where: { username: checkUsername }
      });
      
      if (!existing) {
        username = checkUsername;
        isUnique = true;
      } else {
        suffix++;
      }
    }

    return username;
  }
}
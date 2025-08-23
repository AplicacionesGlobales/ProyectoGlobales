import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../../generated/prisma';
import { UserCreationData } from '../interfaces/brand-registration.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserCreationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que el email y username no estén en uso
   * @param email Email a validar
   * @param username Username a validar
   * @returns Promise<{ emailExists: boolean, usernameExists: boolean }>
   */
  async validateUserUniqueness(email: string, username: string): Promise<{
    emailExists: boolean;
    usernameExists: boolean;
  }> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.prisma.user.findFirst({
        where: { email: email.toLowerCase() }
      }),
      this.prisma.user.findFirst({
        where: { username }
      })
    ]);

    return {
      emailExists: !!existingEmail,
      usernameExists: !!existingUsername
    };
  }

  /**
   * Crea el hash de la contraseña de forma segura
   * @param password Contraseña en texto plano
   * @returns Promise<string> Hash de la contraseña
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Incrementado para mayor seguridad
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Crea un nuevo usuario ROOT en la base de datos
   * @param userData Datos del usuario a crear
   * @returns Promise con el usuario creado
   */
  async createRootUser(userData: UserCreationData) {
    return this.prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        username: userData.username,
        firstName: userData.firstName || '', 
        lastName: userData.lastName || null, 
        role: UserRole.ROOT,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
  }

  /**
   * Verifica si un usuario con el ID dado tiene rol ROOT
   * @param userId ID del usuario a verificar
   * @returns Promise<boolean>
   */
  async isUserRoot(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user?.role === UserRole.ROOT;
  }
}

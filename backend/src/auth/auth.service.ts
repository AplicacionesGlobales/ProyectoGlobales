import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService, ResetTokenPayload } from '../common/services/crypto.service';
import * as bcrypt from 'bcryptjs';
import { RegisterClientDto, AuthResponse, ForgotPasswordDto, ValidateResetTokenDto, ResetPasswordDto, ForgotPasswordResponseDto, ValidateTokenResponseDto, ResetPasswordResponseDto, LoginAdminDto, LoginClientDto, AdminAuthResponse } from './dto';
import { BaseResponseDto, ErrorDetail } from '../common/dto';
import { UserRole } from '../../generated/prisma';
import { randomBytes } from 'crypto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private cryptoService: CryptoService,
  ) {}

  async registerClient(registerDto: RegisterClientDto): Promise<BaseResponseDto<AuthResponse>> {
    const errors: ErrorDetail[] = [];

    try {
      // Verificar username único
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: registerDto.username }
      });

      if (existingUsername) {
        errors.push({ 
          code: ERROR_CODES.USERNAME_EXISTS, 
          description: ERROR_MESSAGES.USERNAME_EXISTS 
        });
      }

      // Verificar marca existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: registerDto.branchId },
        select: { id: true, name: true }
      });

      if (!brand) {
        errors.push({ 
          code: ERROR_CODES.BRANCH_NOT_EXISTS, 
          description: ERROR_MESSAGES.BRANCH_NOT_EXISTS 
        });
      }

      // Verificar email único en marca
      if (brand) {
        const existingUserBrand = await this.prisma.userBrand.findFirst({
          where: {
            email: registerDto.email,
            brandId: registerDto.branchId
          }
        });

        if (existingUserBrand) {
          errors.push({ 
            code: ERROR_CODES.EMAIL_EXISTS_IN_BRANCH, 
            description: ERROR_MESSAGES.EMAIL_EXISTS_IN_BRANCH 
          });
        }
      }

      if (errors.length > 0) {
        return BaseResponseDto.error(errors);
      }

      // Crear/obtener usuario
      let user = await this.prisma.user.findFirst({
        where: { username: registerDto.username }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: registerDto.email,
            username: registerDto.username,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: UserRole.CLIENT,
          }
        });
      }

      // Crear UserBrand
      const passwordHash = await bcrypt.hash(registerDto.password, 12);
      const salt = randomBytes(32).toString('hex');

      const userBrand = await this.prisma.userBrand.create({
        data: {
          userId: user.id,
          brandId: registerDto.branchId,
          email: registerDto.email,
          passwordHash,
          salt,
        }
      });

      // Generar JWT
      const token = this.jwtService.sign({
        userId: user.id,
        userBrandId: userBrand.id,
        brandId: registerDto.branchId,
        role: user.role,
      });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: registerDto.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          role: user.role,
        },
        brand: {
          id: brand!.id,
          name: brand!.name,
        },
        token,
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error en registerClient:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR, 
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  // ==================== PASSWORD RESET METHODS ====================

  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<BaseResponseDto<ForgotPasswordResponseDto>> {
    try {
      const { email } = forgotPasswordDto;
      
      // Buscar usuario por email principal o en UserBrand
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            {
              userBrands: {
                some: { email: email.toLowerCase() }
              }
            }
          ]
        },
        include: {
          userBrands: {
            where: { email: email.toLowerCase() },
            include: { brand: true }
          }
        }
      });

      // Por seguridad, siempre retornamos éxito, incluso si el usuario no existe
      if (!user) {
        return BaseResponseDto.success({
          success: true,
          message: 'Si existe una cuenta con este email, recibirás un enlace de restablecimiento.'
        });
      }

      // Invalidar tokens existentes del usuario
      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() }
        },
        data: { used: true }
      });

      // Generar nuevo token
      const resetToken = this.cryptoService.generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const passwordResetToken = await this.prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
          used: false,
        },
      });

      // Crear JWT token para la URL
      const jwtPayload: ResetTokenPayload = {
        userId: user.id,
        email: email.toLowerCase(),
        tokenId: passwordResetToken.id,
      };
      
      const jwtToken = this.cryptoService.createJWTToken(jwtPayload);
      
      // Crear URL de reset
      const resetUrl = `${process.env.BASE_URL}/reset-password?token=${jwtToken}`;

      // Enviar email
      const emailSent = await this.emailService.sendEmail({
        to: email.toLowerCase(),
        subject: 'Restablecer tu contraseña',
        html: this.emailService.loadTemplate('password-reset', {
          appName: process.env.APP_NAME || 'WhiteLabel',
          userName: user.firstName || '',
          resetUrl,
          supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tuapp.com',
          currentYear: new Date().getFullYear().toString(),
        }),
      });

      if (!emailSent) {
        throw new Error('Error al enviar el email');
      }

      return BaseResponseDto.success({
        success: true,
        message: 'Si existe una cuenta con este email, recibirás un enlace de restablecimiento.'
      });

    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        'Error interno del servidor. Inténtalo más tarde.'
      );
    }
  }

  async validateResetToken(validateTokenDto: ValidateResetTokenDto): Promise<BaseResponseDto<ValidateTokenResponseDto>> {
    try {
      const { token } = validateTokenDto;

      // Verificar JWT
      const payload = this.cryptoService.verifyJWTToken(token);
      if (!payload) {
        return BaseResponseDto.success({
          valid: false,
          message: 'Token inválido o expirado'
        });
      }

      // Verificar que el token existe en la DB y no ha sido usado
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      });

      if (!resetToken) {
        return BaseResponseDto.success({
          valid: false,
          message: 'Token no encontrado'
        });
      }

      if (resetToken.used) {
        return BaseResponseDto.success({
          valid: false,
          message: 'Este token ya ha sido utilizado'
        });
      }

      if (resetToken.expiresAt < new Date()) {
        return BaseResponseDto.success({
          valid: false,
          message: 'El token ha expirado'
        });
      }

      if (resetToken.userId !== payload.userId) {
        return BaseResponseDto.success({
          valid: false,
          message: 'Token inválido'
        });
      }

      return BaseResponseDto.success({
        valid: true,
        userId: resetToken.userId,
        email: payload.email,
        message: 'Token válido',
      });

    } catch (error) {
      console.error('Error validando token:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        'Error validando el token'
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<BaseResponseDto<ResetPasswordResponseDto>> {
    try {
      const { token, password, confirmPassword } = resetPasswordDto;

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        return BaseResponseDto.success({
          success: false,
          message: 'Las contraseñas no coinciden',
          errors: { confirmPassword: ['Las contraseñas no coinciden'] }
        });
      }

      // Validar token primero
      const validation = await this.validateResetToken({ token });
      if (!validation.data?.valid || !validation.data?.userId) {
        return BaseResponseDto.success({
          success: false,
          message: validation.data?.message || 'Token inválido'
        });
      }

      // Hash de la nueva contraseña
      const hashedPassword = await this.cryptoService.hashPassword(password);

      // Decodificar JWT para obtener tokenId y email
      const payload = this.cryptoService.verifyJWTToken(token);
      if (!payload) {
        return BaseResponseDto.success({
          success: false,
          message: 'Token inválido'
        });
      }

      // Determinar si actualizar usuario principal o UserBrand
      const user = await this.prisma.user.findUnique({
        where: { id: validation.data.userId },
        include: {
          userBrands: {
            where: { email: payload.email }
          }
        }
      });

      if (!user) {
        return BaseResponseDto.success({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar contraseña en transacción
      await this.prisma.$transaction([
        // Si el email coincide con el email principal del usuario, actualizar la tabla User
        ...(user.email === payload.email ? [
          this.prisma.user.update({
            where: { id: validation.data.userId },
            data: { /* No actualizamos password en User porque no tiene campo password */ },
          })
        ] : []),
        
        // Si hay UserBrand con ese email, actualizar ahí
        ...(user.userBrands.length > 0 ? [
          this.prisma.userBrand.updateMany({
            where: {
              userId: validation.data.userId,
              email: payload.email
            },
            data: { passwordHash: hashedPassword },
          })
        ] : []),
        
        // Marcar token como usado
        this.prisma.passwordResetToken.update({
          where: { id: payload.tokenId },
          data: { used: true },
        }),
        
        // Invalidar todos los otros tokens del usuario
        this.prisma.passwordResetToken.updateMany({
          where: {
            userId: validation.data.userId,
            used: false,
            id: { not: payload.tokenId },
          },
          data: { used: true },
        }),
      ]);

      // 🆕 ENVIAR EMAIL DE CONFIRMACIÓN CON ENLACE DE EMERGENCIA
      await this.sendPasswordUpdatedNotification(user, payload.email);

      return BaseResponseDto.success({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });

    } catch (error) {
      console.error('Error en resetPassword:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        'Error interno del servidor'
      );
    }
  }

  // Enviar notificación de contraseña actualizada
  private async sendPasswordUpdatedNotification(user: any, email: string): Promise<void> {
    try {
      // Generar token de emergencia (válido por 24 horas)
      const emergencyToken = this.cryptoService.generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas para emergencia

      const emergencyResetToken = await this.prisma.passwordResetToken.create({
        data: {
          token: emergencyToken,
          userId: user.id,
          expiresAt,
          used: false,
        },
      });

      // Crear JWT token para la URL de emergencia
      const emergencyJwtPayload: ResetTokenPayload = {
        userId: user.id,
        email: email.toLowerCase(),
        tokenId: emergencyResetToken.id,
      };
      
      const emergencyJwtToken = this.cryptoService.createJWTToken(emergencyJwtPayload);
      
      // Crear URL de reset de emergencia
      const emergencyResetUrl = `${process.env.BASE_URL}/reset-password?token=${emergencyJwtToken}&emergency=true`;

      // Formatear fecha y hora actual
      const updateTime = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Costa_Rica',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Enviar email de notificación
      await this.emailService.sendEmail({
        to: email.toLowerCase(),
        subject: `${process.env.APP_NAME || 'WhiteLabel'} - Contraseña Actualizada`,
        html: this.emailService.loadTemplate('password-updated', {
          appName: process.env.APP_NAME || 'WhiteLabel',
          userName: user.firstName || 'Usuario',
          updateTime,
          emergencyResetUrl,
          supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tuapp.com',
          currentYear: new Date().getFullYear().toString(),
        }),
      });

      console.log(`Email de confirmación enviado a ${email}`);
    } catch (error) {
      // No fallar el proceso principal si el email falla
      console.error('Error enviando email de confirmación:', error);
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.prisma.passwordResetToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true },
          ],
        },
      });

      console.log(`Eliminados ${result.count} tokens expirados/usados`);
      return result.count;
    } catch (error) {
      console.error('Error limpiando tokens:', error);
      return 0;
    }
  }

  private generateApiKey(): string {
    return randomBytes(32).toString('hex');
  }

  private generateSalt(): string {
    // Incluir timestamp para hacer el salt único incluso con la misma contraseña
    const timestamp = Date.now().toString();
    const random = randomBytes(16).toString('hex');
    return `${random}_${timestamp}`;
  }

  // ==================== BRAND REGISTRATION METHOD ====================

  /**
   * Login para usuarios ADMIN/ROOT
   * @param loginDto Datos de login del admin
   * @returns Promise con la respuesta de autenticación
   */
  async loginAdmin(loginDto: LoginAdminDto): Promise<BaseResponseDto<AdminAuthResponse>> {
    const errors: ErrorDetail[] = [];

    try {
      // Para ADMIN/ROOT, buscamos en UserBrand por email y brandId
      if (!loginDto.brandId) {
        errors.push({ 
          code: ERROR_CODES.BRAND_NOT_EXISTS, 
          description: 'Se requiere especificar una marca para el login' 
        });
        return BaseResponseDto.error(errors);
      }

      const userBrand = await this.prisma.userBrand.findFirst({
        where: { 
          email: loginDto.email.toLowerCase(),
          brandId: loginDto.brandId,
          isActive: true
        },
        include: {
          user: {
            include: {
              brands: true, // Marcas que posee (para ROOT)
              userBrands: {
                include: { brand: true }
              }
            }
          },
          brand: true
        }
      });

      if (!userBrand) {
        errors.push({ 
          code: ERROR_CODES.USER_NOT_FOUND, 
          description: ERROR_MESSAGES.USER_NOT_FOUND 
        });
        return BaseResponseDto.error(errors);
      }

      // Verificar que es ADMIN o ROOT
      if (userBrand.user.role !== UserRole.ADMIN && userBrand.user.role !== UserRole.ROOT) {
        errors.push({ 
          code: ERROR_CODES.INSUFFICIENT_PERMISSIONS, 
          description: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS 
        });
        return BaseResponseDto.error(errors);
      }

      // Verificar contraseña
      const passwordValid = await bcrypt.compare(loginDto.password, userBrand.passwordHash);
      if (!passwordValid) {
        errors.push({ 
          code: ERROR_CODES.INVALID_CREDENTIALS, 
          description: ERROR_MESSAGES.INVALID_CREDENTIALS 
        });
        return BaseResponseDto.error(errors);
      }

      // Generar JWT
      const token = this.jwtService.sign({
        userId: userBrand.user.id,
        userBrandId: userBrand.id,
        brandId: loginDto.brandId,
        role: userBrand.user.role,
      });

      // Preparar lista de marcas accesibles
      const accessibleBrands = [
        // Marcas que posee como ROOT
        ...userBrand.user.brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          description: brand.description || undefined,
          isOwner: true
        })),
        // Marcas asignadas como CLIENT/ADMIN
        ...userBrand.user.userBrands.map(ub => ({
          id: ub.brand.id,
          name: ub.brand.name,
          description: ub.brand.description || undefined,
          isOwner: false
        }))
      ];

      const response: AdminAuthResponse = {
        user: {
          id: userBrand.user.id,
          email: userBrand.email,
          username: userBrand.user.username,
          firstName: userBrand.user.firstName || undefined,
          lastName: userBrand.user.lastName || undefined,
          role: userBrand.user.role,
        },
        brand: {
          id: userBrand.brand.id,
          name: userBrand.brand.name,
        },
        token,
        brands: accessibleBrands,
        selectedBrand: {
          id: userBrand.brand.id,
          name: userBrand.brand.name,
          description: userBrand.brand.description || undefined,
        }
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error en loginAdmin:', error);
      errors.push({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        description: ERROR_MESSAGES.INTERNAL_ERROR 
      });
      return BaseResponseDto.error(errors);
    }
  }

  /**
   * Login para usuarios CLIENT
   * @param loginDto Datos de login del cliente
   * @returns Promise con la respuesta de autenticación
   */
  async loginClient(loginDto: LoginClientDto): Promise<BaseResponseDto<AuthResponse>> {
    const errors: ErrorDetail[] = [];

    try {
      // Buscar UserBrand por email y brandId
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          email: loginDto.email.toLowerCase(),
          brandId: loginDto.brandId,
          isActive: true
        },
        include: {
          user: true,
          brand: true
        }
      });

      if (!userBrand) {
        errors.push({ 
          code: ERROR_CODES.USER_NOT_FOUND, 
          description: ERROR_MESSAGES.USER_NOT_FOUND 
        });
        return BaseResponseDto.error(errors);
      }

      // Verificar contraseña
      const passwordValid = await bcrypt.compare(loginDto.password, userBrand.passwordHash);
      if (!passwordValid) {
        errors.push({ 
          code: ERROR_CODES.INVALID_CREDENTIALS, 
          description: ERROR_MESSAGES.INVALID_CREDENTIALS 
        });
        return BaseResponseDto.error(errors);
      }

      // Verificar que el usuario esté activo
      if (!userBrand.user.isActive) {
        errors.push({ 
          code: ERROR_CODES.USER_INACTIVE, 
          description: ERROR_MESSAGES.USER_INACTIVE 
        });
        return BaseResponseDto.error(errors);
      }

      // Generar JWT
      const token = this.jwtService.sign({
        userId: userBrand.user.id,
        userBrandId: userBrand.id,
        brandId: loginDto.brandId,
        role: userBrand.user.role,
      });

      const response: AuthResponse = {
        user: {
          id: userBrand.user.id,
          email: userBrand.email,
          username: userBrand.user.username,
          firstName: userBrand.user.firstName || undefined,
          lastName: userBrand.user.lastName || undefined,
          role: userBrand.user.role,
        },
        brand: {
          id: userBrand.brand.id,
          name: userBrand.brand.name,
        },
        token,
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error en loginClient:', error);
      errors.push({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        description: ERROR_MESSAGES.INTERNAL_ERROR 
      });
      return BaseResponseDto.error(errors);
    }
  }

}
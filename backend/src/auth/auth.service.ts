import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService, ResetTokenPayload } from '../common/services/crypto.service';
import * as bcrypt from 'bcryptjs';
import { RegisterClientDto, AuthResponse, ForgotPasswordDto, ValidateResetTokenDto, ResetPasswordDto, ForgotPasswordResponseDto, ValidateTokenResponseDto, ResetPasswordResponseDto } from './dto';
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

      // Verificar sucursal existe
      const branch = await this.prisma.branch.findUnique({
        where: { id: registerDto.branchId },
        include: { business: { select: { name: true } } }
      });

      if (!branch) {
        errors.push({ 
          code: ERROR_CODES.BRANCH_NOT_EXISTS, 
          description: ERROR_MESSAGES.BRANCH_NOT_EXISTS 
        });
      }

      // Verificar email único en sucursal
      if (branch) {
        const existingUserBranch = await this.prisma.userBranch.findFirst({
          where: {
            email: registerDto.email,
            branchId: registerDto.branchId
          }
        });

        if (existingUserBranch) {
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

      // Crear UserBranch
      const passwordHash = await bcrypt.hash(registerDto.password, 12);
      const apiKey = this.generateApiKey();

      const userBranch = await this.prisma.userBranch.create({
        data: {
          userId: user.id,
          branchId: registerDto.branchId,
          email: registerDto.email,
          passwordHash,
          apiKey,
        }
      });

      // Generar JWT
      const token = this.jwtService.sign({
        userId: user.id,
        userBranchId: userBranch.id,
        branchId: registerDto.branchId,
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
        branch: {
          id: branch!.id,
          name: branch!.name,
          businessName: branch!.business.name,
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
      
      // Buscar usuario por email principal o en UserBranch
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            {
              userBranches: {
                some: { email: email.toLowerCase() }
              }
            }
          ]
        },
        include: {
          userBranches: {
            where: { email: email.toLowerCase() },
            include: { branch: { include: { business: true } } }
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
        html: this.emailService.loadTemplate('reset-password', {
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

      // Determinar si actualizar usuario principal o UserBranch
      const user = await this.prisma.user.findUnique({
        where: { id: validation.data.userId },
        include: {
          userBranches: {
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
        
        // Si hay UserBranch con ese email, actualizar ahí
        ...(user.userBranches.length > 0 ? [
          this.prisma.userBranch.updateMany({
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

  // 🆕 NUEVO MÉTODO: Enviar notificación de contraseña actualizada
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

      console.log(`✅ Email de confirmación enviado a ${email}`);
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
}
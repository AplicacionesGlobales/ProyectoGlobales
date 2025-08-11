import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';
import * as bcrypt from 'bcryptjs';
import { ValidateResetCodeDto, RegisterClientDto, AuthResponse, ForgotPasswordDto, ResetPasswordDto, ForgotPasswordResponseDto, ResetPasswordResponseDto, LoginAdminDto, LoginClientDto, AdminAuthResponse, ValidateCodeResponseDto } from './dto';
import { CreateBrandDto } from './dto/create-brand.dto';
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

  // Métodos actualizados del AuthService

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
        message: 'Si existe una cuenta con este email, recibirás un código de restablecimiento.'
      });
    }

    // Invalidar códigos existentes del usuario para este email
    await this.prisma.passwordResetCode.updateMany({
      where: {
        userId: user.id,
        email: email.toLowerCase(),
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: { used: true }
    });

    // Generar nuevo código de 6 dígitos
    const resetCode = this.cryptoService.generateResetCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutos de expiración

    await this.prisma.passwordResetCode.create({
      data: {
        code: resetCode,
        userId: user.id,
        email: email.toLowerCase(),
        expiresAt,
        used: false,
        attempts: 0,
      },
    });

    // Enviar email con el código
    const emailSent = await this.emailService.sendEmail({
      to: email.toLowerCase(),
      subject: 'Código para restablecer tu contraseña',
      html: this.emailService.loadTemplate('password-reset', {
        appName: process.env.APP_NAME || 'WhiteLabel',
        userName: user.firstName || '',
        resetCode,
        supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tuapp.com',
        currentYear: new Date().getFullYear().toString(),
      }),
    });

    if (!emailSent) {
      throw new Error('Error al enviar el email');
    }

    return BaseResponseDto.success({
      success: true,
      message: 'Si existe una cuenta con este email, recibirás un código de restablecimiento.'
    });

  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    return BaseResponseDto.singleError(
      ERROR_CODES.INTERNAL_ERROR,
      'Error interno del servidor. Inténtalo más tarde.'
    );
  }
}

  async validateResetCode(validateCodeDto: ValidateResetCodeDto): Promise<BaseResponseDto<ValidateCodeResponseDto>> {
    try {
      const { code, email } = validateCodeDto;

      // Buscar el código en la base de datos
      const resetCode = await this.prisma.passwordResetCode.findFirst({
        where: {
          code: code,
          email: email.toLowerCase(),
          used: false,
          expiresAt: { gt: new Date() }
        },
        include: { user: true },
      });

      if (!resetCode) {
        // Intentar incrementar el contador de intentos si existe el código
        await this.prisma.passwordResetCode.updateMany({
          where: {
            code: code,
            email: email.toLowerCase(),
          },
          data: {
            attempts: { increment: 1 }
          }
        });

        return BaseResponseDto.success({
          valid: false,
          message: 'Código inválido o expirado'
        });
      }

      // Verificar límite de intentos (máximo 5 intentos)
      if (resetCode.attempts >= 5) {
        await this.prisma.passwordResetCode.update({
          where: { id: resetCode.id },
          data: { used: true }
        });

        return BaseResponseDto.success({
          valid: false,
          message: 'Código bloqueado por exceso de intentos'
        });
      }

      return BaseResponseDto.success({
        valid: true,
        userId: resetCode.userId,
        email: resetCode.email,
        message: 'Código válido',
      });

    } catch (error) {
      console.error('Error validando código:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        'Error validando el código'
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<BaseResponseDto<ResetPasswordResponseDto>> {
    try {
      const { code, email, password, confirmPassword } = resetPasswordDto;

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        return BaseResponseDto.success({
          success: false,
          message: 'Las contraseñas no coinciden',
          errors: { confirmPassword: ['Las contraseñas no coinciden'] }
        });
      }

      // Validar código primero
      const validation = await this.validateResetCode({ code, email });
      if (!validation.data?.valid || !validation.data?.userId) {
        return BaseResponseDto.success({
          success: false,
          message: validation.data?.message || 'Código inválido'
        });
      }

      // Hash de la nueva contraseña
      const hashedPassword = await this.cryptoService.hashPassword(password);

      // Buscar el código específico para marcarlo como usado
      const resetCodeRecord = await this.prisma.passwordResetCode.findFirst({
        where: {
          code: code,
          email: email.toLowerCase(),
          used: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!resetCodeRecord) {
        return BaseResponseDto.success({
          success: false,
          message: 'Código inválido o expirado'
        });
      }

      // Determinar si actualizar usuario principal o UserBrand
      const user = await this.prisma.user.findUnique({
        where: { id: validation.data.userId },
        include: {
          userBrands: {
            where: { email: email.toLowerCase() }
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
        ...(user.email === email.toLowerCase() ? [
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
              email: email.toLowerCase()
            },
            data: { passwordHash: hashedPassword },
          })
        ] : []),
        
        // Marcar código como usado
        this.prisma.passwordResetCode.update({
          where: { id: resetCodeRecord.id },
          data: { used: true },
        }),
        
        // Invalidar todos los otros códigos del usuario para este email
        this.prisma.passwordResetCode.updateMany({
          where: {
            userId: validation.data.userId,
            email: email.toLowerCase(),
            used: false,
            id: { not: resetCodeRecord.id },
          },
          data: { used: true },
        }),
      ]);

      // Enviar email de confirmación con código de emergencia
      await this.sendPasswordUpdatedNotification(user, email.toLowerCase());

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

  // Enviar notificación de contraseña actualizada con código de emergencia
  private async sendPasswordUpdatedNotification(user: any, email: string): Promise<void> {
    try {
      // Generar código de emergencia (válido por 24 horas)
      const emergencyCode = this.cryptoService.generateResetCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas para emergencia

      await this.prisma.passwordResetCode.create({
        data: {
          code: emergencyCode,
          userId: user.id,
          email: email.toLowerCase(),
          expiresAt,
          used: false,
          attempts: 0,
        },
      });

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
          emergencyCode,
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

  async cleanupExpiredCodes(): Promise<number> {
    try {
      const result = await this.prisma.passwordResetCode.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true },
          ],
        },
      });

      console.log(`Eliminados ${result.count} códigos expirados/usados`);
      return result.count;
    } catch (error) {
      console.error('Error limpiando códigos:', error);
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

  async registerBrand(createBrandDto: CreateBrandDto): Promise<BaseResponseDto<any>> {
    const errors: ErrorDetail[] = [];

    try {
      // Verificar que el email no exista como usuario
      const existingUser = await this.prisma.user.findFirst({
        where: { email: createBrandDto.email }
      });

      if (existingUser) {
        errors.push({ 
          code: ERROR_CODES.EMAIL_EXISTS, 
          description: ERROR_MESSAGES.EMAIL_EXISTS 
        });
        return BaseResponseDto.error(errors);
      }

      // Crear la marca y el usuario en una transacción
      const result = await this.prisma.$transaction(async (prisma) => {
        // Crear el usuario ROOT/propietario
        const user = await prisma.user.create({
          data: {
            email: createBrandDto.email,
            username: createBrandDto.email, // Usar email como username por defecto
            firstName: createBrandDto.ownerName.split(' ')[0],
            lastName: createBrandDto.ownerName.split(' ').slice(1).join(' ') || '',
            role: UserRole.ROOT, // Usuario ROOT es el propietario de la marca
          }
        });

        // Crear la marca
        const brand = await prisma.brand.create({
          data: {
            name: createBrandDto.name,
            description: createBrandDto.description,
            phone: createBrandDto.phone,
            ownerId: user.id, // Relación con el usuario ROOT
            logoUrl: createBrandDto.logoUrl,
            isotopoUrl: createBrandDto.isotopoUrl,
            imagotipoUrl: createBrandDto.imagotipoUrl,
          }
        });

        // Crear paleta de colores si se proporcionó
        if (createBrandDto.customColors && createBrandDto.customColors.length >= 5) {
          await prisma.colorPalette.create({
            data: {
              brandId: brand.id,
              primary: createBrandDto.customColors[0],
              secondary: createBrandDto.customColors[1],
              accent: createBrandDto.customColors[2],
              neutral: createBrandDto.customColors[3],
              success: createBrandDto.customColors[4],
            }
          });
        }

        // Crear UserBrand para el acceso del propietario
        const salt = randomBytes(32).toString('hex') + Date.now().toString();
        const hashedPassword = await bcrypt.hash(createBrandDto.password, 12);

        await prisma.userBrand.create({
          data: {
            userId: user.id,
            brandId: brand.id,
            email: createBrandDto.email,
            passwordHash: hashedPassword,
            salt: salt,
          }
        });

        return { brand, user };
      });

      // Generar JWT token
      const payload = { 
        userId: result.user.id, 
        email: result.user.email,
        brandId: result.brand.id,
        role: result.user.role 
      };
      const token = this.jwtService.sign(payload);

      const response = {
        message: 'Marca y usuario creados exitosamente',
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        },
        brand: {
          id: result.brand.id,
          name: result.brand.name,
        },
        token,
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error en registerBrand:', error);
      errors.push({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        description: ERROR_MESSAGES.INTERNAL_ERROR 
      });
      return BaseResponseDto.error(errors);
    }
  }

}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';
import { FileService } from '../common/services/file.service';
import { PlanService } from '../common/services/plan.service';
import { PaymentService } from '../common/services/payment.service';
import { ColorPaletteService } from './services/color-palette.service';
import * as bcrypt from 'bcryptjs';
import { ValidateResetCodeDto, ProfileResponseDto, RegisterClientDto, AuthResponse, UpdateProfileDto, ForgotPasswordDto, ResetPasswordDto, ForgotPasswordResponseDto, ResetPasswordResponseDto, ValidateCodeResponseDto, LoginRequestDto, RefreshRequestDto, RefreshResponseDto } from './dto';
import { BaseResponseDto, ErrorDetail } from '../common/dto';
import { UserRole } from '../../generated/prisma';
import { randomBytes } from 'crypto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';
import { createAccessToken, createRefreshToken, verifyRefreshToken, comparePassword } from '../lib/crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
  ) { }

  private get appName(): string {
    return this.configService.get<string>('APP_NAME') || 'WhiteLabel';
  }

  async registerClient(registerDto: RegisterClientDto): Promise<BaseResponseDto<AuthResponse>> {
    console.log('\n🔍 === REGISTRO CLIENT INICIADO ===');
    console.log('📧 Email:', registerDto.email);
    console.log('👤 Username:', registerDto.username);
    console.log('🏢 BrandId:', registerDto.branchId);
    console.log('📅 Timestamp:', new Date().toISOString());

    const errors: ErrorDetail[] = [];

    try {
      // Validar contraseña
      console.log('\n🔐 Validando contraseña...');
      const passwordValidation = this.validatePassword(registerDto.password);
      if (!passwordValidation.isValid) {
        console.log('❌ Contraseña inválida:', passwordValidation.errors);
        errors.push(...passwordValidation.errors);
      } else {
        console.log('✅ Contraseña válida');
      }

      // Verificar username único
      console.log('\n🔎 Verificando username único globalmente...');
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: registerDto.username }
      });

      if (existingUsername) {
        console.log('❌ USERNAME YA EXISTE:', {
          id: existingUsername.id,
          email: existingUsername.email,
          username: existingUsername.username,
          createdAt: existingUsername.createdAt
        });
        errors.push({
          code: ERROR_CODES.USERNAME_EXISTS,
          description: ERROR_MESSAGES.USERNAME_EXISTS
        });
      } else {
        console.log('✅ Username disponible');
      }

      // Verificar marca existe
      console.log('\n🏢 Verificando marca existe...');
      const brand = await this.prisma.brand.findUnique({
        where: { id: registerDto.branchId },
        select: { id: true, name: true }
      });

      if (!brand) {
        console.log('❌ Marca no encontrada:', registerDto.branchId);
        errors.push({
          code: ERROR_CODES.BRANCH_NOT_EXISTS,
          description: ERROR_MESSAGES.BRANCH_NOT_EXISTS
        });
      } else {
        console.log('✅ Marca encontrada:', brand);
      }

      // Verificar email único - debe ser único globalmente pero permitir registro en diferentes marcas
      console.log('\n📧 Verificando email único en marca...');
      let existingUserWithEmail = await this.prisma.user.findFirst({
        where: { email: registerDto.email },
        include: {
          userBrands: {
            where: { brandId: registerDto.branchId }
          }
        }
      });

      if (existingUserWithEmail) {
        console.log('👤 Usuario con ese email existe:', {
          id: existingUserWithEmail.id,
          username: existingUserWithEmail.username,
          email: existingUserWithEmail.email,
          userBrandsInThisBrand: existingUserWithEmail.userBrands.length
        });
      } else {
        console.log('✅ Email no existe en el sistema');
      }

      // Si existe el usuario y ya está registrado en esta marca
      if (existingUserWithEmail && existingUserWithEmail.userBrands.length > 0) {
        console.log('❌ EMAIL YA REGISTRADO EN ESTA MARCA');
        errors.push({
          code: ERROR_CODES.EMAIL_EXISTS_IN_BRANCH,
          description: ERROR_MESSAGES.EMAIL_EXISTS_IN_BRANCH
        });
      } else if (existingUserWithEmail) {
        console.log('✅ Usuario existe pero no en esta marca - permitir registro');
      }

      if (errors.length > 0) {
        console.log('\n❌ ERRORES ENCONTRADOS:', errors);
        return BaseResponseDto.error(errors);
      }

      // Crear/obtener usuario
      console.log('\n👤 Creando/obteniendo usuario...');
      let user;

      if (!existingUserWithEmail) {
        console.log('🆕 Creando nuevo usuario...');
        user = await this.prisma.user.create({
          data: {
            email: registerDto.email,
            username: registerDto.username,
            firstName: registerDto.firstName || '',
            lastName: registerDto.lastName || null,
            role: UserRole.CLIENT,
          },
          include: {
            userBrands: true
          }
        });
        console.log('✅ Usuario creado:', {
          id: user.id,
          email: user.email,
          username: user.username
        });
      } else {
        console.log('🔄 Usando usuario existente:', {
          id: existingUserWithEmail.id,
          email: existingUserWithEmail.email,
          username: existingUserWithEmail.username
        });
        user = existingUserWithEmail;
      }

      // Crear UserBrand (sin email, solo la relación)
      console.log('\n🔗 Creando relación UserBrand...');
      const passwordHash = await bcrypt.hash(registerDto.password, 12);
      const salt = randomBytes(32).toString('hex');

      const userBrand = await this.prisma.userBrand.create({
        data: {
          userId: user.id,
          brandId: registerDto.branchId,
          passwordHash,
          salt,
        }
      });

      console.log('✅ UserBrand creado:', {
        id: userBrand.id,
        userId: userBrand.userId,
        brandId: userBrand.brandId
      });

      // Generar JWT
      console.log('\n🔑 Generando token JWT...');
      const tokenPayload = {
        userId: user.id,
        userBrandId: userBrand.id,
        brandId: registerDto.branchId,
        email: user.email,
        username: user.username,
        role: user.role,
      };
      const token = createAccessToken(tokenPayload);

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
        rememberMe: false // El registro no incluye rememberMe
      };

      console.log('\n🎉 === REGISTRO EXITOSO ===');
      console.log('✅ Usuario registrado:', user.email);
      console.log('✅ Username:', user.username);
      console.log('✅ En marca:', brand!.name);
      console.log('✅ Token generado');

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('\n💥 === ERROR EN REGISTRO ===');
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

      // Buscar usuario por email principal
      const user = await this.prisma.user.findFirst({
        where: { email: email.toLowerCase() },
        include: {
          userBrands: {
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
          appName: this.appName,
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
          userBrands: true
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
        // Actualizar contraseña en todas las UserBrand del usuario
        ...(user.userBrands.length > 0 ? [
          this.prisma.userBrand.updateMany({
            where: {
              userId: validation.data.userId,
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
        subject: `${this.appName} - Contraseña Actualizada`,
        html: this.emailService.loadTemplate('password-updated', {
          appName: this.appName,
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


  // ==================== LOGIN AND REFRESH TOKEN METHODS ====================

  async login(loginDto: LoginRequestDto): Promise<BaseResponseDto<AuthResponse>> {
    console.log('\n🔍 === LOGIN INICIADO ===');
    console.log('📧 Email:', loginDto.email);
    console.log('🔒 Remember Me:', loginDto.rememberMe);
    console.log('📅 Timestamp:', new Date().toISOString());

    const errors: ErrorDetail[] = [];

    try {
      // Buscar usuario por email
      const user = await this.prisma.user.findFirst({
        where: { email: loginDto.email.toLowerCase() },
        include: {
          userBrands: {
            include: {
              brand: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      if (!user) {
        console.log('❌ Usuario no encontrado');
        errors.push({
          code: ERROR_CODES.USER_NOT_FOUND,
          description: 'Credenciales inválidas'
        });
        return BaseResponseDto.error(errors);
      }

      // Verificar contraseña
      console.log('🔐 Verificando contraseñas...');
      console.log('👤 UserBrands encontrados:', user.userBrands.length);

      let passwordValid = false;
      let userBrand: any = null;

      // Si tiene UserBrands, verificar contraseña ahí
      if (user.userBrands.length > 0) {
        for (const ub of user.userBrands) {
          console.log('🔍 Verificando UserBrand:', {
            id: ub.id,
            userId: ub.userId,
            brandId: ub.brandId,
            hasPasswordHash: !!ub.passwordHash,
            passwordHashType: typeof ub.passwordHash,
            passwordHashLength: ub.passwordHash ? ub.passwordHash.length : 0
          });

          console.log('📝 Parámetros de comparePassword:', {
            password: '***' + loginDto.password.slice(-2),
            passwordLength: loginDto.password.length,
            hash: ub.passwordHash ? '***' + ub.passwordHash.slice(-10) : 'NULL',
            hashLength: ub.passwordHash ? ub.passwordHash.length : 0
          });

          if (await comparePassword(loginDto.password, ub.passwordHash)) {
            passwordValid = true;
            userBrand = ub;
            console.log('✅ Contraseña válida para UserBrand:', ub.id);
            break;
          } else {
            console.log('❌ Contraseña inválida para UserBrand:', ub.id);
          }
        }
      } else {
        console.log('⚠️ Usuario sin UserBrands - no se puede autenticar');
      }

      if (!passwordValid) {
        console.log('❌ Contraseña inválida');
        errors.push({
          code: ERROR_CODES.USER_NOT_FOUND,
          description: 'Credenciales inválidas'
        });
        return BaseResponseDto.error(errors);
      }

      console.log('✅ Credenciales válidas');

      // Crear tokens
      const tokenPayload = {
        userId: user.id,
        userBrandId: userBrand?.id,
        brandId: userBrand?.brandId,
        email: user.email,
        username: user.username,
        role: user.role
      };

      const accessToken = createAccessToken(tokenPayload);
      let refreshToken: string | undefined;

      // Solo crear refresh token si rememberMe es true
      if (loginDto.rememberMe) {
        refreshToken = createRefreshToken(tokenPayload);
        console.log('✅ Refresh token creado (sesión indefinida)');
      }

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          role: user.role,
        },
        brand: userBrand?.brand ? {
          id: userBrand.brand.id,
          name: userBrand.brand.name,
        } : undefined,
        token: accessToken,
        refreshToken,
        rememberMe: loginDto.rememberMe || false
      };

      console.log('\n🎉 === LOGIN EXITOSO ===');
      console.log('✅ Usuario:', user.email);
      console.log('✅ Remember Me:', loginDto.rememberMe);
      console.log('✅ Refresh Token:', refreshToken ? 'Generado' : 'No generado');

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('\n💥 === ERROR EN LOGIN ===');
      console.error('Error en login:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  async refreshToken(refreshDto: RefreshRequestDto): Promise<BaseResponseDto<RefreshResponseDto>> {
    console.log('\n🔄 === REFRESH TOKEN INICIADO ===');
    console.log('📅 Timestamp:', new Date().toISOString());

    try {
      // Verificar refresh token
      const payload = verifyRefreshToken(refreshDto.refreshToken);

      if (!payload) {
        console.log('❌ Refresh token inválido');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Refresh token inválido o expirado'
        );
      }

      // Verificar que el usuario aún existe
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        console.log('❌ Usuario no encontrado o inactivo');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no encontrado'
        );
      }

      console.log('✅ Refresh token válido para usuario:', user.email);

      // Crear nuevos tokens
      const newTokenPayload = {
        userId: user.id,
        userBrandId: payload.userBrandId,
        brandId: payload.brandId,
        email: user.email,
        username: user.username,
        role: user.role
      };

      const newAccessToken = createAccessToken(newTokenPayload);
      const newRefreshToken = createRefreshToken(newTokenPayload); // Nuevo refresh token indefinido

      const response: RefreshResponseDto = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        },
        renewedAt: new Date().toISOString()
      };

      console.log('\n🎉 === REFRESH EXITOSO ===');
      console.log('✅ Nuevo access token generado');
      console.log('✅ Nuevo refresh token indefinido generado');

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('\n💥 === ERROR EN REFRESH ===');
      console.error('Error en refreshToken:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        'Error interno del servidor'
      );
    }
  }

  // ==================== PASSWORD VALIDATION ====================

  private validatePassword(password: string): { isValid: boolean; errors: ErrorDetail[] } {
    const errors: ErrorDetail[] = [];

    if (password.length < 6) {
      errors.push({
        code: ERROR_CODES.WEAK_PASSWORD,
        description: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        code: ERROR_CODES.WEAK_PASSWORD,
        description: 'La contraseña debe contener al menos una letra minúscula'
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        code: ERROR_CODES.WEAK_PASSWORD,
        description: 'La contraseña debe contener al menos una letra mayúscula'
      });
    }

    if (!/\d/.test(password)) {
      errors.push({
        code: ERROR_CODES.WEAK_PASSWORD,
        description: 'La contraseña debe contener al menos un número'
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  // ==================== PROFILE METHODS ====================

  async getProfile(userPayload: any): Promise<BaseResponseDto<ProfileResponseDto>> {
    try {
      console.log('\n🔍 === OBTENIENDO PERFIL ===');
      console.log('👤 User ID:', userPayload.userId);
      console.log('📅 Timestamp:', new Date().toISOString());

      // Obtener usuario con los campos básicos del perfil
      const user = await this.prisma.user.findUnique({
        where: {
          id: userPayload.userId,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        console.log('❌ Usuario no encontrado o inactivo');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no encontrado'
        );
      }

      console.log('✅ Perfil obtenido exitosamente:', user.email);

      const profileResponse: ProfileResponseDto = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return BaseResponseDto.success(profileResponse);

    } catch (error) {
      console.error('\n💥 === ERROR OBTENIENDO PERFIL ===');
      console.error('Error en getProfile:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }


  async updateProfile(
    userPayload: any,
    updateProfileDto: UpdateProfileDto
  ): Promise<BaseResponseDto<ProfileResponseDto>> {
    try {
      console.log('\n🔍 === ACTUALIZANDO PERFIL ===');
      console.log('👤 User ID:', userPayload.userId);
      console.log('📊 Datos a actualizar:', updateProfileDto);
      console.log('📅 Timestamp:', new Date().toISOString());

      // Verificar si el username ya existe (solo si se está intentando cambiar)
      if (updateProfileDto.username) {
        const existingUser = await this.prisma.user.findFirst({
          where: {
            username: updateProfileDto.username,
            id: { not: userPayload.userId } // Excluir al usuario actual
          }
        });

        if (existingUser) {
          console.log('❌ Username ya existe:', updateProfileDto.username);
          return BaseResponseDto.singleError(
            ERROR_CODES.USERNAME_EXISTS,
            ERROR_MESSAGES.USERNAME_EXISTS
          );
        }
      }

      // Actualizar el usuario
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userPayload.userId,
          isActive: true
        },
        data: {
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          phone: updateProfileDto.phone,
          username: updateProfileDto.username,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      console.log('✅ Perfil actualizado exitosamente:', updatedUser.email);

      const profileResponse: ProfileResponseDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName || undefined,
        phone: updatedUser.phone || undefined,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      return BaseResponseDto.success(profileResponse);

    } catch (error) {
      console.error('\n💥 === ERROR ACTUALIZANDO PERFIL ===');
      console.error('Error en updateProfile:', error);

      // Manejar error de registro único de Prisma
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (target && target.includes('username')) {
          return BaseResponseDto.singleError(
            ERROR_CODES.USERNAME_EXISTS,
            ERROR_MESSAGES.USERNAME_EXISTS
          );
        }
      }

      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }
}
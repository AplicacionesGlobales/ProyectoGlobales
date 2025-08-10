import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterBrandDto } from '../dto/register-brand.dto';
import { BrandRegistrationResponse } from '../dto/brand-registration-response.dto';
import { BaseResponseDto, ErrorDetail } from '../../common/dto';
import { UserCreationService } from './user-creation.service';
import { BrandCreationService } from './brand-creation.service';
import { ColorPaletteService } from './color-palette.service';
import { 
  BrandRegistrationResult,
  UserCreationData,
  BrandCreationData,
  ColorPaletteCreationData 
} from '../interfaces/brand-registration.interface';
import { ERROR_CODES, ERROR_MESSAGES } from '../../common/constants';

@Injectable()
export class BrandRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userCreationService: UserCreationService,
    private readonly brandCreationService: BrandCreationService,
    private readonly colorPaletteService: ColorPaletteService
  ) {}

  /**
   * Registra una nueva marca con su usuario ROOT y paleta de colores
   * @param registerDto Datos de registro de la marca
   * @returns Promise con la respuesta del registro
   */
  async registerBrand(registerDto: RegisterBrandDto): Promise<BaseResponseDto<BrandRegistrationResponse>> {
    const errors: ErrorDetail[] = [];

    try {
      // 1. Validaciones previas
      await this.validateRegistrationData(registerDto, errors);

      if (errors.length > 0) {
        return {
          successful: false,
          data: undefined,
          error: errors
        };
      }

      // 2. Ejecutar registro en transacción
      const result = await this.executeRegistrationTransaction(registerDto);

      // 3. Generar token JWT
      const accessToken = await this.generateAccessToken(result.user);

      // 4. Preparar respuesta
      const response: BrandRegistrationResponse = {
        brandId: result.brand.id,
        userId: result.user.id,
        colorPaletteId: result.colorPalette.id,
        brandName: result.brand.name,
        username: result.user.username,
        email: result.user.email,
        accessToken,
        createdAt: new Date(),
        message: 'Marca y usuario ROOT creados exitosamente. Tu aplicación estará lista en 10 días hábiles.'
      };

      return {
        successful: true,
        data: response
      };

    } catch (error) {
      console.error('Error en registro de marca:', error);
      
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error interno del servidor durante el registro');
    }
  }

  /**
   * Valida todos los datos de registro antes de proceder
   * @param registerDto Datos a validar
   * @param errors Array para acumular errores
   */
  private async validateRegistrationData(registerDto: RegisterBrandDto, errors: ErrorDetail[]): Promise<void> {
    // Validar unicidad de usuario
    const userValidation = await this.userCreationService.validateUserUniqueness(
      registerDto.user.email,
      registerDto.user.username
    );

    if (userValidation.emailExists) {
      errors.push({
        field: 'user.email',
        message: 'El email ya está registrado',
        description: 'El email ya está registrado',
        code: ERROR_CODES.EMAIL_ALREADY_EXISTS
      });
    }

    if (userValidation.usernameExists) {
      errors.push({
        field: 'user.username',
        message: 'El username ya está en uso',
        description: 'El username ya está en uso',
        code: ERROR_CODES.USERNAME_ALREADY_EXISTS
      });
    }

    // Validar colores hexadecimales
    if (!this.colorPaletteService.validateHexColors(registerDto.colorPalette)) {
      errors.push({
        field: 'colorPalette',
        message: 'Uno o más colores tienen formato hexadecimal inválido',
        description: 'Uno o más colores tienen formato hexadecimal inválido',
        code: ERROR_CODES.INVALID_COLOR_FORMAT
      });
    }

    // Validar contraseña fuerte (ejemplo básico)
    if (!this.validateStrongPassword(registerDto.user.password)) {
      errors.push({
        field: 'user.password',
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
        description: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
        code: ERROR_CODES.WEAK_PASSWORD
      });
    }
  }

  /**
   * Ejecuta el proceso de registro completo en una transacción de base de datos
   * @param registerDto Datos de registro
   * @returns Promise con el resultado del registro
   */
  private async executeRegistrationTransaction(registerDto: RegisterBrandDto): Promise<BrandRegistrationResult> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear usuario ROOT
      const passwordHash = await this.userCreationService.hashPassword(registerDto.user.password);
      
      const userData: UserCreationData = {
        email: registerDto.user.email,
        username: registerDto.user.username,
        passwordHash,
        firstName: registerDto.user.firstName,
        lastName: registerDto.user.lastName,
        role: 'ROOT'
      };

      const user = await tx.user.create({
        data: {
          email: userData.email.toLowerCase(),
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'ROOT',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true
        }
      });

      // 2. Crear marca
      const brandData: BrandCreationData = {
        name: registerDto.brand.name,
        description: registerDto.brand.description,
        address: registerDto.brand.address,
        phone: registerDto.brand.phone,
        ownerId: user.id
      };

      const brand = await tx.brand.create({
        data: {
          name: brandData.name.trim(),
          description: brandData.description?.trim(),
          address: brandData.address?.trim(),
          phone: brandData.phone?.trim(),
          ownerId: brandData.ownerId,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          phone: true
        }
      });

      // 3. Crear paleta de colores
      const normalizedColors = this.colorPaletteService.normalizeColors(registerDto.colorPalette);
      
      const colorPalette = await tx.colorPalette.create({
        data: {
          ...normalizedColors,
          brandId: brand.id
        },
        select: {
          id: true,
          primary: true,
          secondary: true,
          accent: true,
          neutral: true,
          success: true
        }
      });

      return { user, brand, colorPalette };
    });
  }

  /**
   * Genera un token JWT para el usuario registrado
   * @param user Datos del usuario
   * @returns Promise con el token JWT
   */
  private async generateAccessToken(user: { id: number; email: string; username: string }): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: 'ROOT',
      type: 'access_token'
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '24h' // Token válido por 24 horas
    });
  }

  /**
   * Valida que la contraseña sea suficientemente fuerte
   * @param password Contraseña a validar
   * @returns boolean true si es fuerte
   */
  private validateStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }
}

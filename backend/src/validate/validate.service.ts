import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { EmailValidationResponseDto, UsernameValidationResponseDto } from './dto';
import { ERROR_CODES } from '../common/constants';

@Injectable()
export class ValidateService {
  constructor(private prisma: PrismaService) {}

  async validateEmail(email: string, brandId?: number): Promise<BaseResponseDto<EmailValidationResponseDto>> {
    try {
      console.log('\n🔍 === VALIDACIÓN EMAIL ===');
      console.log('📧 Email solicitado:', email);
      console.log('🏢 BrandId:', brandId);
      
      const normalizedEmail = email.toLowerCase().trim();
      console.log('📧 Email normalizado:', normalizedEmail);

      // Para ROOT/ADMIN: email debe ser único globalmente
      if (!brandId) {
        console.log('🔑 Validación para ROOT/ADMIN (sin brandId)');
        const existingUser = await this.prisma.user.findFirst({
          where: { email: normalizedEmail }
        });
        
        if (existingUser) {
          console.log('❌ EMAIL OCUPADO (ROOT/ADMIN):', existingUser);
          return BaseResponseDto.success({
            isAvailable: false,
            email: normalizedEmail
          });
        } else {
          console.log('✅ EMAIL DISPONIBLE (ROOT/ADMIN)');
          return BaseResponseDto.success({
            isAvailable: true,
            email: normalizedEmail
          });
        }
      }

      // Para CLIENT: verificar si el email ya existe y si ya está registrado en esa marca
      console.log('👤 Validación para CLIENT (con brandId)');
      const existingUser = await this.prisma.user.findFirst({
        where: { email: normalizedEmail },
        include: {
          userBrands: {
            where: { brandId: brandId },
            include: {
              brand: {
                select: { name: true }
              }
            }
          }
        }
      });

      // Si el usuario no existe, está disponible
      if (!existingUser) {
        console.log('✅ EMAIL DISPONIBLE (no existe usuario)');
        return BaseResponseDto.success({
          isAvailable: true,
          email: normalizedEmail
        });
      }

      console.log('👤 Usuario con este email existe:', {
        id: existingUser.id,
        username: existingUser.username,
        userBrandsInThisBrand: existingUser.userBrands.length
      });

      // Si el usuario existe pero no está en esta marca, está disponible para esta marca
      const isAlreadyInBrand = existingUser.userBrands.length > 0;
      if (isAlreadyInBrand) {
        console.log('❌ EMAIL YA REGISTRADO EN ESTA MARCA');
        return BaseResponseDto.success({
          isAvailable: false,
          email: normalizedEmail
        });
      } else {
        console.log('✅ EMAIL DISPONIBLE EN ESTA MARCA (usuario existe en otras marcas)');
        return BaseResponseDto.success({
          isAvailable: true,
          email: normalizedEmail
        });
      }

    } catch (error) {
      console.error('💥 Error validating email:', error);
      return BaseResponseDto.error([{ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        description: 'Error validating email' 
      }]);
    }
  }

  async validateUsername(username: string): Promise<BaseResponseDto<UsernameValidationResponseDto>> {
    try {
      console.log('\n🔍 === VALIDACIÓN USERNAME ===');
      console.log('👤 Username solicitado:', username);
      
      const normalizedUsername = username.toLowerCase().trim();
      console.log('👤 Username normalizado:', normalizedUsername);

      // Username debe ser único globalmente
      const existingUser = await this.prisma.user.findFirst({
        where: { username: normalizedUsername }
      });

      if (existingUser) {
        console.log('❌ USERNAME OCUPADO:', {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          createdAt: existingUser.createdAt
        });
        return BaseResponseDto.success({
          isAvailable: false,
          username: normalizedUsername
        });
      } else {
        console.log('✅ USERNAME DISPONIBLE');
        return BaseResponseDto.success({
          isAvailable: true,
          username: normalizedUsername
        });
      }

    } catch (error) {
      console.error('💥 Error validating username:', error);
      return BaseResponseDto.error([{ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        description: 'Error validating username' 
      }]);
    }
  }
}

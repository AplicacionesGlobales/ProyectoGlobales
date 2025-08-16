// backend\src\validate\validate.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { EmailValidationResponseDto, UsernameValidationResponseDto,
  PaymentValidationResponseDto, 
 } from './dto';
import { ERROR_CODES } from '../common/constants';

@Injectable()
export class ValidateService {
  constructor(private prisma: PrismaService) { }

  async validateEmail(email: string, brandId?: number): Promise<BaseResponseDto<EmailValidationResponseDto>> {
    try {
      console.log('\n🔍 === VALIDACIÓN EMAIL ===');
      console.log('📧 Email solicitado:', email);
      console.log('🏢 BrandId:', brandId);

      const normalizedEmail = email.toLowerCase().trim();
      console.log('📧 Email normalizado:', normalizedEmail);

      // Si no se proporciona brandId, validar en todas las marcas
      if (brandId === undefined || brandId === null) {
        console.log('🌐 Validación GLOBAL (sin brandId específico)');
        const existingUser = await this.prisma.user.findFirst({
          where: { email: normalizedEmail },
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

        if (existingUser && existingUser.userBrands.length > 0) {
          console.log('❌ EMAIL OCUPADO EN ALGUNA MARCA:', {
            userId: existingUser.id,
            marcas: existingUser.userBrands.map(ub => ({
              brandId: ub.brand.id,
              brandName: ub.brand.name
            }))
          });
          return BaseResponseDto.success({
            isAvailable: false,
            email: normalizedEmail
          });
        } else {
          console.log('✅ EMAIL DISPONIBLE GLOBALMENTE');
          return BaseResponseDto.success({
            isAvailable: true,
            email: normalizedEmail
          });
        }
      }

      // Para CLIENT con brandId específico: verificar si ya está registrado en esa marca
      console.log('👤 Validación para marca específica (brandId:', brandId, ')');
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


  async validatePayment(brandId: number): Promise<BaseResponseDto<PaymentValidationResponseDto>> {
    try {
      console.log('\n🔍 === VALIDACIÓN PAGO ===');
      console.log('🏢 Brand ID:', brandId);

      // Obtener el plan activo del brand
      const brandPlan = await this.prisma.brandPlan.findFirst({
        where: { 
          brandId: brandId,
          isActive: true
        },
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!brandPlan) {
        console.log('⚠️ Brand no tiene plan activo');
        return BaseResponseDto.success({
          isPaymentComplete: false,
          paymentStatus: 'no_plan'
        });
      }

      // Si el plan es gratuito (web)
      if (brandPlan.plan.type === 'web' && Number(brandPlan.price) === 0) {
        console.log('✅ Plan gratuito, no requiere pago');
        return BaseResponseDto.success({
          isPaymentComplete: true,
          paymentStatus: 'free_plan'
        });
      }

      // Verificar el último pago
      const lastPayment = brandPlan.payments[0];
      
      if (!lastPayment) {
        console.log('⚠️ No hay pagos registrados');
        return BaseResponseDto.success({
          isPaymentComplete: false,
          paymentStatus: 'pending',
          dueDate: brandPlan.startDate.toISOString()
        });
      }

      console.log('💰 Último pago:', {
        status: lastPayment.status,
        amount: lastPayment.amount,
        date: lastPayment.processedAt
      });

      if (lastPayment.status === 'completed') {
        console.log('✅ Pago completado');
        return BaseResponseDto.success({
          isPaymentComplete: true,
          paymentStatus: 'completed'
        });
      }

      // Pago pendiente o fallido
      return BaseResponseDto.success({
        isPaymentComplete: false,
        paymentStatus: lastPayment.status,
        dueDate: brandPlan.endDate?.toISOString() || undefined
      });

    } catch (error) {
      console.error('💥 Error validating payment:', error);
      return BaseResponseDto.error([{
        code: ERROR_CODES.INTERNAL_ERROR,
        description: 'Error validating payment status'
      }]);
    }
  }

}

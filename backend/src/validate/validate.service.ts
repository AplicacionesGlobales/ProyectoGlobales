// backend\src\validate\validate.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import {
  EmailValidationResponseDto,
  UsernameValidationResponseDto,
  PaymentValidationResponseDto,
  ValidateCalendarDto,
  CalendarValidationResponseDto,
} from './dto';
import { ERROR_CODES } from '../common/constants';

@Injectable()
export class ValidateService {
  constructor(private prisma: PrismaService) {}

  async validateEmail(
    email: string,
    brandId?: number,
  ): Promise<BaseResponseDto<EmailValidationResponseDto>> {
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
                  select: { id: true, name: true },
                },
              },
            },
          },
        });

        if (existingUser && existingUser.userBrands.length > 0) {
          console.log('❌ EMAIL OCUPADO EN ALGUNA MARCA:', {
            userId: existingUser.id,
            marcas: existingUser.userBrands.map((ub) => ({
              brandId: ub.brand.id,
              brandName: ub.brand.name,
            })),
          });
          return BaseResponseDto.success({
            isAvailable: false,
            email: normalizedEmail,
          });
        } else {
          console.log('✅ EMAIL DISPONIBLE GLOBALMENTE');
          return BaseResponseDto.success({
            isAvailable: true,
            email: normalizedEmail,
          });
        }
      }

      // Para CLIENT con brandId específico: verificar si ya está registrado en esa marca
      console.log(
        '👤 Validación para marca específica (brandId:',
        brandId,
        ')',
      );
      const existingUser = await this.prisma.user.findFirst({
        where: { email: normalizedEmail },
        include: {
          userBrands: {
            where: { brandId: brandId },
            include: {
              brand: {
                select: { name: true },
              },
            },
          },
        },
      });

      // Si el usuario no existe, está disponible
      if (!existingUser) {
        console.log('✅ EMAIL DISPONIBLE (no existe usuario)');
        return BaseResponseDto.success({
          isAvailable: true,
          email: normalizedEmail,
        });
      }

      console.log('👤 Usuario con este email existe:', {
        id: existingUser.id,
        username: existingUser.username,
        userBrandsInThisBrand: existingUser.userBrands.length,
      });

      // Si el usuario existe pero no está en esta marca, está disponible para esta marca
      const isAlreadyInBrand = existingUser.userBrands.length > 0;
      if (isAlreadyInBrand) {
        console.log('❌ EMAIL YA REGISTRADO EN ESTA MARCA');
        return BaseResponseDto.success({
          isAvailable: false,
          email: normalizedEmail,
        });
      } else {
        console.log(
          '✅ EMAIL DISPONIBLE EN ESTA MARCA (usuario existe en otras marcas)',
        );
        return BaseResponseDto.success({
          isAvailable: true,
          email: normalizedEmail,
        });
      }
    } catch (error) {
      console.error('💥 Error validating email:', error);
      return BaseResponseDto.error([
        {
          code: ERROR_CODES.INTERNAL_ERROR,
          description: 'Error validating email',
        },
      ]);
    }
  }

  async validateUsername(
    username: string,
  ): Promise<BaseResponseDto<UsernameValidationResponseDto>> {
    try {
      console.log('\n🔍 === VALIDACIÓN USERNAME ===');
      console.log('👤 Username solicitado:', username);

      const normalizedUsername = username.toLowerCase().trim();
      console.log('👤 Username normalizado:', normalizedUsername);

      // Username debe ser único globalmente
      const existingUser = await this.prisma.user.findFirst({
        where: { username: normalizedUsername },
      });

      if (existingUser) {
        console.log('❌ USERNAME OCUPADO:', {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          createdAt: existingUser.createdAt,
        });
        return BaseResponseDto.success({
          isAvailable: false,
          username: normalizedUsername,
        });
      } else {
        console.log('✅ USERNAME DISPONIBLE');
        return BaseResponseDto.success({
          isAvailable: true,
          username: normalizedUsername,
        });
      }
    } catch (error) {
      console.error('💥 Error validating username:', error);
      return BaseResponseDto.error([
        {
          code: ERROR_CODES.INTERNAL_ERROR,
          description: 'Error validating username',
        },
      ]);
    }
  }

  async validatePayment(
    brandId: number,
  ): Promise<BaseResponseDto<PaymentValidationResponseDto>> {
    try {
      console.log('\n🔍 === VALIDACIÓN PAGO ===');
      console.log('🏢 Brand ID:', brandId);

      // Obtener información completa del brand
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        include: {
          userBrands: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            take: 1, // Solo necesitamos el primer usuario (owner)
          },
          brandPlans: {
            where: { isActive: true },
            include: {
              plan: true,
              payments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
            take: 1,
          },
        },
      });

      if (!brand) {
        console.log('❌ Brand no encontrado');
        return BaseResponseDto.error([
          {
            code: ERROR_CODES.INTERNAL_ERROR,
            description: 'Brand no encontrado',
          },
        ]);
      }

      // Obtener información del owner
      const owner = brand.userBrands[0]?.user;
      const brandPlan = brand.brandPlans[0];

      // Preparar información del brand para el frontend
      const brandInfo = {
        id: brand.id,
        name: brand.name,
        phone: brand.phone || undefined,
        owner: owner
          ? {
              firstName: owner.firstName || '',
              lastName: owner.lastName || '',
              email: owner.email,
            }
          : undefined,
        plan: brandPlan
          ? {
              type: brandPlan.plan.type,
              billingCycle: brandPlan.billingPeriod,
            }
          : undefined,
      };

      if (!brandPlan) {
        console.log('⚠️ Brand no tiene plan activo');
        return BaseResponseDto.success({
          isPaymentComplete: false,
          paymentStatus: 'no_plan',
          brandInfo,
        });
      }

      // Si el plan es gratuito (web)
      if (brandPlan.plan.type === 'web' && Number(brandPlan.price) === 0) {
        console.log('✅ Plan gratuito, no requiere pago');
        return BaseResponseDto.success({
          isPaymentComplete: true,
          paymentStatus: 'free_plan',
          brandInfo,
        });
      }

      // Verificar el último pago
      const lastPayment = brandPlan.payments[0];

      if (!lastPayment) {
        console.log('⚠️ No hay pagos registrados');
        return BaseResponseDto.success({
          isPaymentComplete: false,
          paymentStatus: 'pending',
          dueDate: brandPlan.startDate.toISOString(),
          brandInfo,
        });
      }

      console.log('💰 Último pago:', {
        status: lastPayment.status,
        amount: lastPayment.amount,
        date: lastPayment.processedAt,
      });

      if (lastPayment.status === 'completed') {
        console.log('✅ Pago completado');
        return BaseResponseDto.success({
          isPaymentComplete: true,
          paymentStatus: 'completed',
          brandInfo,
        });
      }

      // Pago pendiente o fallido
      return BaseResponseDto.success({
        isPaymentComplete: false,
        paymentStatus: lastPayment.status,
        dueDate: brandPlan.endDate?.toISOString() || undefined,
        brandInfo,
      });
    } catch (error) {
      console.error('💥 Error validating payment:', error);
      return BaseResponseDto.error([
        {
          code: ERROR_CODES.INTERNAL_ERROR,
          description: 'Error validating payment status',
        },
      ]);
    }
  }

  async validateCalendarAvailable(
    brandId: number,
    query: ValidateCalendarDto,
  ): Promise<BaseResponseDto<CalendarValidationResponseDto>> {
    try {
      console.log('\n🗓️ === VALIDACIÓN CALENDARIO ===');
      console.log('🏢 Brand ID:', brandId);
      console.log('📅 Fecha:', query.date);
      console.log('🕐 Hora:', query.time);

      // 1. Verificar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        select: { id: true, name: true, isActive: true },
      });

      if (!brand) {
        console.log('❌ Brand no encontrado');
        return BaseResponseDto.error([
          {
            code: ERROR_CODES.INTERNAL_ERROR,
            description: 'Brand no encontrado',
          },
        ]);
      }

      if (!brand.isActive) {
        console.log('❌ Brand inactivo');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Negocio no disponible',
          date: query.date,
          time: query.time,
          reason: 'Negocio temporalmente cerrado',
        });
      }

      // 2. Obtener configuración de AppointmentSettings
      const appointmentSettings =
        await this.prisma.appointmentSettings.findUnique({
          where: { brandId },
        });

      if (!appointmentSettings) {
        console.log('❌ No hay configuración de citas');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Configuración de citas no disponible',
          date: query.date,
          time: query.time,
          reason: 'Sistema de citas no configurado',
        });
      }

      // 3. Validar fecha y hora solicitada
      const requestedDateTime = new Date(`${query.date}T${query.time}:00`);
      const now = new Date();

      // Validar que la fecha no sea en el pasado
      if (requestedDateTime < now) {
        console.log('❌ Fecha/hora en el pasado');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason: 'No se pueden reservar horarios pasados',
        });
      }

      // 4. Validar horario mínimo de anticipación
      const hoursDifference =
        (requestedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDifference < appointmentSettings.minAdvanceBookingHours) {
        console.log('❌ No cumple tiempo mínimo de anticipación');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason: `Se requieren al menos ${appointmentSettings.minAdvanceBookingHours} horas de anticipación`,
        });
      }

      // 5. Validar máximo de días de anticipación
      const daysDifference = Math.floor(hoursDifference / 24);
      if (daysDifference > appointmentSettings.maxAdvanceBookingDays) {
        console.log('❌ Excede días máximos de anticipación');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason: `Solo se permiten reservas hasta ${appointmentSettings.maxAdvanceBookingDays} días de anticipación`,
        });
      }

      // 6. Validar si permite reservas el mismo día
      const isSameDay = now.toDateString() === requestedDateTime.toDateString();
      if (isSameDay && !appointmentSettings.allowSameDayBooking) {
        console.log('❌ No permite reservas el mismo día');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason: 'No se permiten reservas para el mismo día',
        });
      }

      // 7. Verificar horarios de negocio
      const dayOfWeek = requestedDateTime.getDay(); // 0 = domingo, 1 = lunes, etc.
      const businessHour = await this.prisma.businessHours.findFirst({
        where: {
          brandId,
          dayOfWeek,
        },
      });

      if (!businessHour || !businessHour.isOpen) {
        console.log('❌ Negocio cerrado ese día');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason: 'Negocio cerrado ese día',
        });
      }

      // 8. Verificar si la hora está dentro del horario de negocio
      const requestedTime = query.time;
      if (
        !businessHour.openTime ||
        !businessHour.closeTime ||
        requestedTime < businessHour.openTime ||
        requestedTime >= businessHour.closeTime
      ) {
        console.log('❌ Hora fuera del horario de negocio');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason:
            businessHour.openTime && businessHour.closeTime
              ? `Horario de atención: ${businessHour.openTime} - ${businessHour.closeTime}`
              : 'Horario de atención no definido',
        });
      }

      // 9. Verificar horarios especiales
      const specialHour = await this.prisma.specialHours.findFirst({
        where: {
          brandId,
          date: new Date(query.date),
        },
      });

      if (specialHour) {
        if (!specialHour.isOpen) {
          console.log('❌ Día especial cerrado');
          return BaseResponseDto.success({
            isAvailable: false,
            message: 'Horario no disponible',
            date: query.date,
            time: query.time,
            reason: specialHour.reason || 'Día especial - cerrado',
          });
        }

        // Si hay horario especial abierto, verificar el horario
        if (specialHour.openTime && specialHour.closeTime) {
          if (
            requestedTime < specialHour.openTime ||
            requestedTime >= specialHour.closeTime
          ) {
            console.log('❌ Hora fuera del horario especial');
            return BaseResponseDto.success({
              isAvailable: false,
              message: 'Horario no disponible',
              date: query.date,
              time: query.time,
              reason: `Horario especial: ${specialHour.openTime} - ${specialHour.closeTime}`,
            });
          }
        }
      }

      // 10. Verificar si hay citas que ocupen ese horario
      const duration = appointmentSettings.defaultDuration;
      const startTime = requestedDateTime;
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          brandId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          OR: [
            {
              // Cita que empieza durante el horario solicitado
              startTime: {
                gte: startTime,
                lt: endTime,
              },
            },
            {
              // Cita que termina durante el horario solicitado
              endTime: {
                gt: startTime,
                lte: endTime,
              },
            },
            {
              // Cita que abarca completamente el horario solicitado
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingAppointment) {
        console.log('❌ Horario ocupado por otra cita');
        return BaseResponseDto.success({
          isAvailable: false,
          message: 'Horario no disponible',
          date: query.date,
          time: query.time,
          reason: 'Horario ya reservado',
        });
      }

      // 11. Si llegamos aquí, el horario está disponible
      console.log('✅ Horario disponible');
      return BaseResponseDto.success({
        isAvailable: true,
        message: 'Horario disponible',
        date: query.date,
        time: query.time,
      });
    } catch (error) {
      console.error('💥 Error validating calendar availability:', error);
      return BaseResponseDto.error([
        {
          code: ERROR_CODES.INTERNAL_ERROR,
          description: 'Error validating calendar availability',
        },
      ]);
    }
  }
}

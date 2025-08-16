// src/schedule/schedule.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';
import {
  BusinessHoursDto,
  UpdateBusinessHoursDto,
  SpecialHoursDto,
  CreateSpecialHoursDto,
  UpdateSpecialHoursDto,
  AppointmentSettingsDto,
  UpdateAppointmentSettingsDto
} from './dto/index';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  private async validateBrandAccess(brandId: number, userId: number): Promise<void> {
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId,
        userId,
        isActive: true
      },
      include: {
        user: true
      }
    });

    if (!userBrand || (!['ROOT', 'ADMIN'].includes(userBrand.user.role))) {
      throw new ForbiddenException('Access denied to this brand');
    }
  }

  // Business Hours Methods
  async getBusinessHours(
    brandId: number, 
    requestingUserId: number
  ): Promise<BaseResponseDto<BusinessHoursDto[]>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      const businessHours = await this.prisma.businessHours.findMany({
        where: { brandId },
        orderBy: { dayOfWeek: 'asc' }
      });

      // Si no hay horarios configurados, crear los predeterminados
      if (businessHours.length === 0) {
        return this.initializeDefaultBusinessHours(brandId, requestingUserId);
      }

      const response = businessHours.map(bh => ({
        id: bh.id,
        dayOfWeek: bh.dayOfWeek,
        dayName: this.getDayName(bh.dayOfWeek),
        isOpen: bh.isOpen,
        openTime: bh.openTime || undefined,
        closeTime: bh.closeTime || undefined,
        createdAt: bh.createdAt.toISOString(),
        updatedAt: bh.updatedAt.toISOString()
      }));

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error getting business hours:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to get business hours');
    }
  }

  async updateBusinessHours(
    brandId: number,
    updateData: UpdateBusinessHoursDto,
    requestingUserId: number
  ): Promise<BaseResponseDto<BusinessHoursDto[]>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Validar los datos de entrada
      this.validateBusinessHoursData(updateData.businessHours);

      // Actualizar en transacción
      const updatedHours = await this.prisma.$transaction(async (prisma) => {
        const results: BusinessHoursDto[] = [];
        
        for (const hourData of updateData.businessHours) {
          const updated = await prisma.businessHours.upsert({
            where: {
              brandId_dayOfWeek: {
                brandId,
                dayOfWeek: hourData.dayOfWeek
              }
            },
            create: {
              brandId,
              dayOfWeek: hourData.dayOfWeek,
              isOpen: hourData.isOpen,
              openTime: hourData.isOpen ? hourData.openTime : null,
              closeTime: hourData.isOpen ? hourData.closeTime : null
            },
            update: {
              isOpen: hourData.isOpen,
              openTime: hourData.isOpen ? hourData.openTime : null,
              closeTime: hourData.isOpen ? hourData.closeTime : null
            }
          });

          results.push({
            id: updated.id,
            dayOfWeek: updated.dayOfWeek,
            dayName: this.getDayName(updated.dayOfWeek),
            isOpen: updated.isOpen,
            openTime: updated.openTime || undefined,
            closeTime: updated.closeTime || undefined
          });
        }

        return results;
      });

      return BaseResponseDto.success(updatedHours);

    } catch (error) {
      console.error('Error updating business hours:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to update business hours');
    }
  }

  // Special Hours Methods
  async getSpecialHours(
    brandId: number,
    startDate?: string,
    endDate?: string,
    requestingUserId?: number
  ): Promise<BaseResponseDto<SpecialHoursDto[]>> {
    try {
      if (requestingUserId) {
        await this.validateBrandAccess(brandId, requestingUserId);
      }

      const where: any = { brandId };

      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      } else if (startDate) {
        where.date = { gte: new Date(startDate) };
      } else if (endDate) {
        where.date = { lte: new Date(endDate) };
      }

      const specialHours = await this.prisma.specialHours.findMany({
        where,
        orderBy: { date: 'asc' }
      });

      const response = specialHours.map(sh => ({
        id: sh.id,
        date: sh.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
        isOpen: sh.isOpen,
        openTime: sh.openTime || undefined,
        closeTime: sh.closeTime || undefined,
        reason: sh.reason || undefined,
        description: sh.description || undefined,
        createdAt: sh.createdAt.toISOString(),
        updatedAt: sh.updatedAt.toISOString()
      }));

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error getting special hours:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to get special hours');
    }
  }

  async createSpecialHour(
    brandId: number,
    createData: CreateSpecialHoursDto,
    requestingUserId: number
  ): Promise<BaseResponseDto<SpecialHoursDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Validar que la fecha no esté duplicada
      const existing = await this.prisma.specialHours.findFirst({
        where: {
          brandId,
          date: new Date(createData.date)
        }
      });

      if (existing) {
        throw new Error('Ya existe un horario especial para esta fecha');
      }

      // Validar que si está abierto, tiene horarios válidos
      if (createData.isOpen && (!createData.openTime || !createData.closeTime)) {
        throw new Error('Debe especificar horarios de apertura y cierre');
      }

      const specialHour = await this.prisma.specialHours.create({
        data: {
          brandId,
          date: new Date(createData.date),
          isOpen: createData.isOpen,
          openTime: createData.isOpen ? createData.openTime : null,
          closeTime: createData.isOpen ? createData.closeTime : null,
          reason: createData.reason,
          description: createData.description
        }
      });

      const response: SpecialHoursDto = {
        id: specialHour.id,
        date: specialHour.date.toISOString().split('T')[0],
        isOpen: specialHour.isOpen,
        openTime: specialHour.openTime || undefined,
        closeTime: specialHour.closeTime || undefined,
        reason: specialHour.reason || undefined,
        description: specialHour.description || undefined,
        createdAt: specialHour.createdAt.toISOString(),
        updatedAt: specialHour.updatedAt.toISOString()
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error creating special hour:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to create special hour');
    }
  }

  async updateSpecialHour(
    brandId: number,
    specialHourId: number,
    updateData: UpdateSpecialHoursDto,
    requestingUserId: number
  ): Promise<BaseResponseDto<SpecialHoursDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Validar que el horario especial existe
      const existing = await this.prisma.specialHours.findUnique({
        where: { id: specialHourId }
      });

      if (!existing || existing.brandId !== brandId) {
        throw new NotFoundException('Horario especial no encontrado');
      }

      // Validar que si está abierto, tiene horarios válidos
      if (updateData.isOpen && (!updateData.openTime || !updateData.closeTime)) {
        throw new Error('Debe especificar horarios de apertura y cierre');
      }

      const updated = await this.prisma.specialHours.update({
        where: { id: specialHourId },
        data: {
          isOpen: updateData.isOpen,
          openTime: updateData.isOpen ? updateData.openTime : null,
          closeTime: updateData.isOpen ? updateData.closeTime : null,
          reason: updateData.reason || existing.reason,
          description: updateData.description || existing.description
        }
      });

      const response: SpecialHoursDto = {
        id: updated.id,
        date: updated.date.toISOString().split('T')[0],
        isOpen: updated.isOpen,
        openTime: updated.openTime || undefined,
        closeTime: updated.closeTime || undefined,
        reason: updated.reason || undefined,
        description: updated.description || undefined,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error updating special hour:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update special hour');
    }
  }

  async deleteSpecialHour(
    brandId: number,
    specialHourId: number,
    requestingUserId: number
  ): Promise<void> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Validar que el horario especial existe
      const existing = await this.prisma.specialHours.findUnique({
        where: { id: specialHourId }
      });

      if (!existing || existing.brandId !== brandId) {
        throw new NotFoundException('Horario especial no encontrado');
      }

      await this.prisma.specialHours.delete({
        where: { id: specialHourId }
      });

    } catch (error) {
      console.error('Error deleting special hour:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to delete special hour');
    }
  }

  // Appointment Settings Methods
  async getAppointmentSettings(
    brandId: number,
    requestingUserId: number
  ): Promise<BaseResponseDto<AppointmentSettingsDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      const settings = await this.prisma.appointmentSettings.findUnique({
        where: { brandId }
      });

      // Si no hay configuración, crear la predeterminada
      if (!settings) {
        return this.initializeDefaultAppointmentSettings(brandId, requestingUserId);
      }

      const response: AppointmentSettingsDto = {
        id: settings.id,
        defaultDuration: settings.defaultDuration,
        bufferTime: settings.bufferTime,
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
        minAdvanceBookingHours: settings.minAdvanceBookingHours,
        allowSameDayBooking: settings.allowSameDayBooking,
        createdAt: settings.createdAt.toISOString(),
        updatedAt: settings.updatedAt.toISOString()
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error getting appointment settings:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to get appointment settings');
    }
  }

  async updateAppointmentSettings(
    brandId: number,
    updateData: UpdateAppointmentSettingsDto,
    requestingUserId: number
  ): Promise<BaseResponseDto<AppointmentSettingsDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Validar los datos
      if (updateData.defaultDuration < 15 || updateData.defaultDuration > 480) {
        throw new Error('La duración por defecto debe estar entre 15 y 480 minutos');
      }
      if (updateData.bufferTime < 0 || updateData.bufferTime > 60) {
        throw new Error('El tiempo de buffer debe estar entre 0 y 60 minutos');
      }
      if (updateData.maxAdvanceBookingDays < 1 || updateData.maxAdvanceBookingDays > 365) {
        throw new Error('Los días máximos de anticipación deben estar entre 1 y 365');
      }
      if (updateData.minAdvanceBookingHours < 0 || updateData.minAdvanceBookingHours > 168) {
        throw new Error('Las horas mínimas de anticipación deben estar entre 0 y 168');
      }

      const updated = await this.prisma.appointmentSettings.upsert({
        where: { brandId },
        create: {
          brandId,
          defaultDuration: updateData.defaultDuration,
          bufferTime: updateData.bufferTime,
          maxAdvanceBookingDays: updateData.maxAdvanceBookingDays,
          minAdvanceBookingHours: updateData.minAdvanceBookingHours,
          allowSameDayBooking: updateData.allowSameDayBooking
        },
        update: {
          defaultDuration: updateData.defaultDuration,
          bufferTime: updateData.bufferTime,
          maxAdvanceBookingDays: updateData.maxAdvanceBookingDays,
          minAdvanceBookingHours: updateData.minAdvanceBookingHours,
          allowSameDayBooking: updateData.allowSameDayBooking
        }
      });

      const response: AppointmentSettingsDto = {
        id: updated.id,
        defaultDuration: updated.defaultDuration,
        bufferTime: updated.bufferTime,
        maxAdvanceBookingDays: updated.maxAdvanceBookingDays,
        minAdvanceBookingHours: updated.minAdvanceBookingHours,
        allowSameDayBooking: updated.allowSameDayBooking,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error updating appointment settings:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to update appointment settings');
    }
  }

  // Helper Methods
  private async initializeDefaultBusinessHours(
    brandId: number,
    requestingUserId: number
  ): Promise<BaseResponseDto<BusinessHoursDto[]>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      const defaultHours = [
        { dayOfWeek: 1, dayName: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 2, dayName: 'Martes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 3, dayName: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 4, dayName: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 5, dayName: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 6, dayName: 'Sábado', isOpen: false },
        { dayOfWeek: 0, dayName: 'Domingo', isOpen: false }
      ];

      const createdHours = await this.prisma.$transaction(
        defaultHours.map(hour => 
          this.prisma.businessHours.create({
            data: {
              brandId,
              dayOfWeek: hour.dayOfWeek,
              isOpen: hour.isOpen,
              openTime: hour.isOpen ? hour.openTime : null,
              closeTime: hour.isOpen ? hour.closeTime : null
            }
          })
        )
      );

      const response = createdHours.map(bh => ({
        id: bh.id,
        dayOfWeek: bh.dayOfWeek,
        dayName: this.getDayName(bh.dayOfWeek),
        isOpen: bh.isOpen,
        openTime: bh.openTime || undefined,
        closeTime: bh.closeTime || undefined,
        createdAt: bh.createdAt.toISOString(),
        updatedAt: bh.updatedAt.toISOString()
      }));

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error initializing default business hours:', error);
      throw new Error('Failed to initialize default business hours');
    }
  }

  private async initializeDefaultAppointmentSettings(
    brandId: number,
    requestingUserId: number
  ): Promise<BaseResponseDto<AppointmentSettingsDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      const defaultSettings = {
        defaultDuration: 30,
        bufferTime: 5,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowSameDayBooking: true
      };

      const settings = await this.prisma.appointmentSettings.create({
        data: {
          brandId,
          ...defaultSettings
        }
      });

      const response: AppointmentSettingsDto = {
        id: settings.id,
        ...defaultSettings,
        createdAt: settings.createdAt.toISOString(),
        updatedAt: settings.updatedAt.toISOString()
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error initializing default appointment settings:', error);
      throw new Error('Failed to initialize default appointment settings');
    }
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  }

  private validateBusinessHoursData(businessHours: BusinessHoursDto[]): void {
    if (!Array.isArray(businessHours)) {
      throw new Error('businessHours must be an array');
    }
    
    for (const hour of businessHours) {
      if (hour.isOpen) {
        if (!hour.openTime || !hour.closeTime) {
          throw new Error(`Día ${hour.dayName}: Debe especificar horarios de apertura y cierre`);
        }
        
        if (!this.isValidTimeFormat(hour.openTime) || !this.isValidTimeFormat(hour.closeTime)) {
          throw new Error(`Día ${hour.dayName}: Formato de hora inválido (use HH:MM)`);
        }

        if (!this.validateWorkingHours(hour.openTime, hour.closeTime)) {
          throw new Error(`Día ${hour.dayName}: La hora de apertura debe ser anterior a la de cierre`);
        }
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  private validateWorkingHours(openTime: string, closeTime: string): boolean {
    const [openHours, openMinutes] = openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
    
    if (openHours < closeHours) {
      return true;
    }
    
    if (openHours === closeHours && openMinutes < closeMinutes) {
      return true;
    }
    
    return false;
  }
}
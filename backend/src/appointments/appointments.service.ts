// src/appointments/appointments.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import {
  AppointmentDto,
  CreateAppointmentDto,
  CreateAppointmentByRootDto,
  UpdateAppointmentDto,
  GetAppointmentsQueryDto,
  AvailableTimeSlotsDto,
  TimeSlotDto,
  AppointmentStatus
} from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // Validación de acceso al brand
  private async validateBrandAccess(brandId: number, userId: number): Promise<boolean> {
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

    return !!userBrand && ['ROOT', 'ADMIN'].includes(userBrand.user.role);
  }

  // Validación si es ROOT del brand
  private async isRootUser(brandId: number, userId: number): Promise<boolean> {
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

    return userBrand?.user.role == "ROOT";
  }

  // Obtener configuraciones del brand
  private async getBrandConfigurations(brandId: number) {
    const [appointmentSettings, businessHours, specialHours] = await Promise.all([
      this.prisma.appointmentSettings.findUnique({
        where: { brandId }
      }),
      this.prisma.businessHours.findMany({
        where: { brandId },
        orderBy: { dayOfWeek: 'asc' }
      }),
      this.prisma.specialHours.findMany({
        where: { brandId }
      })
    ]);

    if (!appointmentSettings) {
      throw new NotFoundException('Configuración de citas no encontrada para este brand');
    }

    return { appointmentSettings, businessHours, specialHours };
  }

  // Validar si una fecha/hora está disponible
  private async validateAppointmentAvailability(
    brandId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number
  ): Promise<void> {
    const { appointmentSettings, businessHours, specialHours } = 
      await this.getBrandConfigurations(brandId);

    // 1. Validar horarios de negocio
    const dayOfWeek = startTime.getDay();
    const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    
    if (!businessHour || !businessHour.isOpen) {
      throw new BadRequestException('El negocio está cerrado este día');
    }

    // 2. Validar horarios especiales
    const dateStr = startTime.toISOString().split('T')[0];
    const specialHour = specialHours.find(
      sh => sh.date.toISOString().split('T')[0] === dateStr
    );

    if (specialHour && !specialHour.isOpen) {
      throw new BadRequestException(`El negocio está cerrado: ${specialHour.reason || 'Día especial'}`);
    }

    // 3. Validar horario dentro del rango de operación
    const startTimeStr = startTime.toTimeString().substring(0, 5);
    const endTimeStr = endTime.toTimeString().substring(0, 5);
    
    const operationStart = specialHour?.openTime || businessHour.openTime;
    const operationEnd = specialHour?.closeTime || businessHour.closeTime;

    if (!operationStart || !operationEnd) {
      throw new BadRequestException('No se pudo determinar el horario de operación para este día');
    }

    if (startTimeStr < operationStart || endTimeStr > operationEnd) {
      throw new BadRequestException(
        `La cita debe estar entre ${operationStart} y ${operationEnd}`
      );
    }

    // 4. Validar restricciones de tiempo
    const now = new Date();
    const timeDiffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (timeDiffHours < appointmentSettings.minAdvanceBookingHours) {
      throw new BadRequestException(
        `Debe reservar con al menos ${appointmentSettings.minAdvanceBookingHours} horas de anticipación`
      );
    }

    const daysDiff = Math.ceil(timeDiffHours / 24);
    if (daysDiff > appointmentSettings.maxAdvanceBookingDays) {
      throw new BadRequestException(
        `No puede reservar con más de ${appointmentSettings.maxAdvanceBookingDays} días de anticipación`
      );
    }

    if (!appointmentSettings.allowSameDayBooking && 
        startTime.toDateString() === now.toDateString()) {
      throw new BadRequestException('No se permiten reservas para el mismo día');
    }

    // 5. Validar conflictos con otras citas
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        brandId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      throw new ConflictException('Ya existe una cita programada en este horario');
    }
  }

  // Crear cita como cliente
  async createAppointment(
    brandId: number,
    createData: CreateAppointmentDto,
    clientId: number
  ): Promise<BaseResponseDto<AppointmentDto>> {
    try {
      const { appointmentSettings } = await this.getBrandConfigurations(brandId);
      
      const startTime = new Date(createData.startTime);
      const duration = createData.duration || appointmentSettings.defaultDuration;
      const endTime = new Date(startTime.getTime() + duration * 60000);

      await this.validateAppointmentAvailability(brandId, startTime, endTime);

      const appointment = await this.prisma.appointment.create({
        data: {
          brandId,
          clientId,
          createdById: clientId,
          startTime,
          endTime,
          duration,
          notes: createData.notes,
          status: AppointmentStatus.PENDING
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return BaseResponseDto.success(this.mapToDto(appointment));
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Crear cita como ROOT (puede asignar cliente o dejarlo vacío)
  async createAppointmentByRoot(
    brandId: number,
    createData: CreateAppointmentByRootDto,
    rootUserId: number
  ): Promise<BaseResponseDto<AppointmentDto>> {
    try {
      if (!(await this.isRootUser(brandId, rootUserId))) {
        throw new ForbiddenException('Solo el ROOT puede crear citas para otros usuarios');
      }

      const { appointmentSettings } = await this.getBrandConfigurations(brandId);
      
      const startTime = new Date(createData.startTime);
      const duration = createData.duration || appointmentSettings.defaultDuration;
      const endTime = new Date(startTime.getTime() + duration * 60000);

      await this.validateAppointmentAvailability(brandId, startTime, endTime);

      // Validar que el cliente existe si se proporciona
      if (createData.clientId) {
        const client = await this.prisma.user.findUnique({
          where: { id: createData.clientId }
        });
        
        if (!client) {
          throw new NotFoundException('Cliente no encontrado');
        }
      }

      const appointment = await this.prisma.appointment.create({
        data: {
          brandId,
          clientId: createData.clientId,
          createdById: rootUserId,
          startTime,
          endTime,
          duration,
          notes: createData.notes,
          status: AppointmentStatus.PENDING
        },
        include: {
          client: createData.clientId ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          } : false,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return BaseResponseDto.success(this.mapToDto(appointment));
    } catch (error) {
      console.error('Error creating appointment by root:', error);
      throw error;
    }
  }

  // Obtener citas (ROOT ve todas, cliente solo las suyas)
  async getAppointments(
    brandId: number,
    userId: number,
    query: GetAppointmentsQueryDto
  ): Promise<BaseResponseDto<{ appointments: AppointmentDto[], total: number, pages: number }>> {
    try {
      const isRoot = await this.isRootUser(brandId, userId);
      
      if (!isRoot) {
        // Si no es ROOT, verificar que sea cliente con citas
        const hasAppointments = await this.prisma.appointment.findFirst({
          where: { brandId, clientId: userId }
        });
        
        if (!hasAppointments) {
          throw new ForbiddenException('No tiene acceso a las citas de este brand');
        }
      }

      const where: any = { brandId };
      
      // Si no es ROOT, solo ver sus propias citas
      if (!isRoot) {
        where.clientId = userId;
      }

      // Aplicar filtros
      if (query.startDate && query.endDate) {
        where.startTime = {
          gte: new Date(query.startDate),
          lte: new Date(`${query.endDate}T23:59:59.999Z`)
        };
      } else if (query.startDate) {
        where.startTime = { gte: new Date(query.startDate) };
      } else if (query.endDate) {
        where.startTime = { lte: new Date(`${query.endDate}T23:59:59.999Z`) };
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.clientId && isRoot) {
        where.clientId = query.clientId;
      }

      const limit = query.limit ?? 10;
      const page = query.page ?? 1;
      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        this.prisma.appointment.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { startTime: 'asc' },
          skip,
          take: limit
        }),
        this.prisma.appointment.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return BaseResponseDto.success({
        appointments: appointments.map(this.mapToDto),
        total,
        pages
      });
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  // Actualizar cita
  async updateAppointment(
    brandId: number,
    appointmentId: number,
    updateData: UpdateAppointmentDto,
    userId: number
  ): Promise<BaseResponseDto<AppointmentDto>> {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment || appointment.brandId !== brandId) {
        throw new NotFoundException('Cita no encontrada');
      }

      const isRoot = await this.isRootUser(brandId, userId);
      
      // Solo el ROOT o el cliente dueño de la cita pueden actualizarla
      if (!isRoot && appointment.clientId !== userId) {
        throw new ForbiddenException('No tiene permisos para actualizar esta cita');
      }

      // Si se cambia la fecha/hora, validar disponibilidad
      if (updateData.startTime || updateData.duration) {
        const startTime = updateData.startTime ? 
          new Date(updateData.startTime) : appointment.startTime;
        const duration = updateData.duration || appointment.duration;
        const endTime = new Date(startTime.getTime() + duration * 60000);

        await this.validateAppointmentAvailability(
          brandId, 
          startTime, 
          endTime, 
          appointmentId
        );
      }

      const updated = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          ...(updateData.startTime && { startTime: new Date(updateData.startTime) }),
          ...(updateData.duration && { 
            duration: updateData.duration,
            endTime: new Date(
              (updateData.startTime ? new Date(updateData.startTime) : appointment.startTime)
                .getTime() + updateData.duration * 60000
            )
          }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.notes !== undefined && { notes: updateData.notes }),
          ...(updateData.clientId !== undefined && isRoot && { clientId: updateData.clientId })
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return BaseResponseDto.success(this.mapToDto(updated));
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  // Obtener horarios disponibles
  async getAvailableTimeSlots(
    brandId: number,
    query: AvailableTimeSlotsDto
  ): Promise<BaseResponseDto<TimeSlotDto[]>> {
    try {
      const { appointmentSettings, businessHours, specialHours } = 
        await this.getBrandConfigurations(brandId);

      const requestedDate = new Date(query.date);
      const dayOfWeek = requestedDate.getDay();
      const duration = query.duration || appointmentSettings.defaultDuration;

      // Verificar si el negocio está abierto ese día
      const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
      if (!businessHour || !businessHour.isOpen) {
        return BaseResponseDto.success([]);
      }

      // Verificar horarios especiales
      const dateStr = requestedDate.toISOString().split('T')[0];
      const specialHour = specialHours.find(
        sh => sh.date.toISOString().split('T')[0] === dateStr
      );

      if (specialHour && !specialHour.isOpen) {
        return BaseResponseDto.success([]);
      }

      // Determinar horarios de operación
      const openTime = specialHour?.openTime || businessHour.openTime;
      const closeTime = specialHour?.closeTime || businessHour.closeTime;

      // Validar que openTime y closeTime no sean null
      if (!openTime || !closeTime) {
        // Puede lanzar una excepción o retornar slots vacíos
        return BaseResponseDto.success([]);
      }

      // Obtener citas existentes del día
      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          brandId,
          status: {
            notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
          },
          startTime: {
            gte: new Date(`${dateStr}T00:00:00.000Z`),
            lt: new Date(`${dateStr}T23:59:59.999Z`)
          }
        }
      });

      // Generar slots de tiempo
      const slots: TimeSlotDto[] = [];
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);

      let currentTime = new Date(requestedDate);
      currentTime.setHours(openHour, openMinute, 0, 0);

      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(closeHour, closeMinute, 0, 0);

      while (currentTime < endOfDay) {
        const slotEndTime = new Date(currentTime.getTime() + duration * 60000);
        
        if (slotEndTime <= endOfDay) {
          const timeStr = currentTime.toTimeString().substring(0, 5);
          
          // Verificar disponibilidad
          const isOccupied = existingAppointments.some(apt => {
            return currentTime < apt.endTime && slotEndTime > apt.startTime;
          });

          slots.push({
            time: timeStr,
            available: !isOccupied,
            reason: isOccupied ? 'Horario ocupado' : undefined
          });
        }

        currentTime.setTime(currentTime.getTime() + (duration + appointmentSettings.bufferTime) * 60000);
      }

      return BaseResponseDto.success(slots);
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }

  // Mapear entidad a DTO
  private mapToDto(appointment: any): AppointmentDto {
    return {
      id: appointment.id,
      brandId: appointment.brandId,
      clientId: appointment.clientId,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      duration: appointment.duration,
      status: appointment.status,
      notes: appointment.notes,
      createdBy: appointment.createdById,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      client: appointment.client,
      creator: appointment.createdBy
    };
  }
}
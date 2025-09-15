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
  UpdateAppointmentStatusDto,
  GetAppointmentsQueryDto,
  AvailableTimeSlotsDto,
  TimeSlotDto,
  AppointmentStatus
} from './dto/appointment.dto';
import {
  GetCalendarMonthDto,
  CalendarMonthResponseDto,
  DayOccupancyDto,
  MonthSummaryDto
} from './dto/calendar-month.dto';
import {
  DayAgendaDto,
  GetDayAgendaQueryDto,
  AgendaSlotDto,
  AgendaSlotType,
  BusinessHoursDto
} from './dto/day-agenda.dto';
import { AppointmentUtils } from './utils/appointment.utils';
import { APPOINTMENT_CONSTANTS } from './utils/appointment.constants';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // Validación de acceso al brand - incluye dueños y clientes
  private async validateBrandAccess(brandId: number, userId: number): Promise<boolean> {
    // Check if user is brand owner
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { ownerId: true }
    });
    
    if (brand?.ownerId === userId) {
      return true;
    }

    // Check if user is a client of this brand
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

    return !!userBrand;
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

    // 1. Validar horarios usando la misma lógica que getDayAgenda
    const dayOfWeek = startTime.getUTCDay(); // Use UTC to match database timezone
    const dateStr = startTime.toISOString().split('T')[0];
    const businessHoursForDay = await this.getBusinessHoursForDay(brandId, dayOfWeek, dateStr);
    
    if (businessHoursForDay.isClosed) {
      throw new BadRequestException('El negocio está cerrado este día');
    }

    // 2. Validar horario dentro del rango de operación
    const startTimeStr = startTime.toTimeString().substring(0, 5);
    const endTimeStr = endTime.toTimeString().substring(0, 5);
    
    const operationStart = businessHoursForDay.start;
    const operationEnd = businessHoursForDay.end;

    if (!operationStart || !operationEnd) {
      throw new BadRequestException('No se pudo determinar el horario de operación para este día');
    }

    if (startTimeStr < operationStart || endTimeStr > operationEnd) {
      throw new BadRequestException(
        `La cita debe estar entre ${operationStart} y ${operationEnd}`
      );
    }

    // 3. Validar restricciones de tiempo
    const now = new Date();
    const timeDiffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

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

  // Obtener el tipo de servicio por defecto para un brand
  private async getDefaultServiceType(brandId: number) {
    return this.prisma.serviceType.findFirst({
      where: {
        brandId,
        isActive: true
      },
      orderBy: [
        { order: 'asc' },  // El servicio con order: 0 será el primero (por defecto)
        { createdAt: 'asc' }  // En caso de empate, el más antiguo
      ]
    });
  }

  // Crear cita como cliente
async createAppointment(
  brandId: number,
  createData: CreateAppointmentDto,
  clientId: number
): Promise<BaseResponseDto<AppointmentDto>> {
  try {
    const { appointmentSettings } = await this.getBrandConfigurations(brandId);
    
    let duration: number;
    let serviceTypeId: number | undefined = createData.serviceTypeId;
    
    // Determinar la duración basada en la configuración del negocio
    if (appointmentSettings.useServiceTypes) {
      // El negocio usa tipos de servicio
      if (!serviceTypeId) {
        // Si no se especifica serviceTypeId, usar el servicio por defecto
        const defaultService = await this.getDefaultServiceType(brandId);
        if (!defaultService) {
          throw new NotFoundException(
            'No se encontró un tipo de servicio por defecto para este negocio'
          );
        }
        serviceTypeId = defaultService.id;
        duration = defaultService.duration;
      } else {
        // Validar el tipo de servicio especificado
        const serviceType = await this.prisma.serviceType.findFirst({
          where: {
            id: serviceTypeId,
            brandId,
            isActive: true
          }
        });
        
        if (!serviceType) {
          throw new NotFoundException(
            'El tipo de servicio seleccionado no existe o no está disponible'
          );
        }
        
        // Usar la duración del tipo de servicio
        duration = serviceType.duration;
      }
      
    } else {
      // El negocio NO usa tipos de servicio - no debe haber serviceTypeId
      if (serviceTypeId) {
        throw new BadRequestException(
          'Este negocio no maneja tipos de servicio específicos'
        );
      }
      
      // Usar duración por defecto del negocio
      duration = appointmentSettings.defaultDuration;
      serviceTypeId = undefined;
    }
    
    const startTime = new Date(createData.startTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    await this.validateAppointmentAvailability(brandId, startTime, endTime);

    const appointment = await this.prisma.appointment.create({
      data: {
        brandId,
        clientId,
        createdById: clientId,
        serviceTypeId, // Se incluye solo si aplica
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
        },
        serviceType: serviceTypeId ? {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            color: true,
            icon: true
          }
        } : false
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
    
    let duration: number;
    let serviceTypeId: number | undefined = createData.serviceTypeId;
    
    // Determinar la duración basada en la configuración del negocio
    if (appointmentSettings.useServiceTypes) {
      // El negocio usa tipos de servicio
      if (!serviceTypeId) {
        // Si no se especifica serviceTypeId, usar el servicio por defecto
        const defaultService = await this.getDefaultServiceType(brandId);
        if (!defaultService) {
          throw new NotFoundException(
            'No se encontró un tipo de servicio por defecto para este negocio'
          );
        }
        serviceTypeId = defaultService.id;
        duration = defaultService.duration;
      } else {
        // Validar el tipo de servicio especificado
        const serviceType = await this.prisma.serviceType.findFirst({
          where: {
            id: serviceTypeId,
            brandId,
            isActive: true
          }
        });
        
        if (!serviceType) {
          throw new NotFoundException(
            'El tipo de servicio seleccionado no existe o no está disponible'
          );
        }
        
        // Usar la duración del tipo de servicio
        duration = serviceType.duration;
      }
      
    } else {
      // El negocio NO usa tipos de servicio - no debe haber serviceTypeId
      if (serviceTypeId) {
        throw new BadRequestException(
          'Este negocio no maneja tipos de servicio específicos'
        );
      }
      
      // Usar duración por defecto del negocio
      duration = appointmentSettings.defaultDuration;
      serviceTypeId = undefined;
    }
    
    const startTime = new Date(createData.startTime);
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
        serviceTypeId, // Se incluye solo si aplica
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
        },
        serviceType: serviceTypeId ? {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            color: true,
            icon: true
          }
        } : false
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

    // Filtro por tipo de servicio si se proporciona
    if (query.serviceTypeId) {
      where.serviceTypeId = query.serviceTypeId;
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
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true,
              color: true,
              icon: true
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

  // Obtener cita específica por ID
  async getAppointmentById(
    brandId: number,
    appointmentId: number,
    userId: number
  ): Promise<BaseResponseDto<AppointmentDto>> {
    try {
      // Validar que appointmentId sea un número válido
      if (!appointmentId || isNaN(appointmentId)) {
        throw new BadRequestException('ID de cita inválido');
      }
      
      const isRoot = await this.isRootUser(brandId, userId);
      
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
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
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true,
              color: true,
              icon: true
            }
          }
        }
      });

      if (!appointment || appointment.brandId !== brandId) {
        throw new NotFoundException('Cita no encontrada');
      }

      // Si no es ROOT, verificar que sea el cliente dueño de la cita
      if (!isRoot && appointment.clientId !== userId) {
        throw new ForbiddenException('No tiene acceso a esta cita');
      }

      return BaseResponseDto.success(this.mapToDto(appointment));
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
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

  // Actualizar solo el estado de una cita
  async updateAppointmentStatus(
    brandId: number,
    appointmentId: number,
    updateData: UpdateAppointmentStatusDto,
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

      // Validar transiciones de estado válidas
      this.validateStatusTransition(appointment.status as AppointmentStatus, updateData.status);

      const updated = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: updateData.status,
          ...(updateData.notes && { notes: updateData.notes })
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
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Validar transiciones de estado válidas
  private validateStatusTransition(currentStatus: AppointmentStatus, newStatus: AppointmentStatus): void {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [
        AppointmentStatus.CONFIRMED, 
        AppointmentStatus.CANCELLED
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.IN_PROGRESS, 
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW
      ],
      [AppointmentStatus.IN_PROGRESS]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
      ],
      [AppointmentStatus.COMPLETED]: [], // Estado final
      [AppointmentStatus.CANCELLED]: [], // Estado final
      [AppointmentStatus.NO_SHOW]: []    // Estado final
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`
      );
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

  // Obtener resumen mensual del calendario
  async getCalendarMonth(
    brandId: number,
    month: string,
    userId: number
  ): Promise<BaseResponseDto<CalendarMonthResponseDto>> {
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

      // Validar formato de mes (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        throw new BadRequestException('Formato de mes inválido. Use YYYY-MM');
      }

      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

      // Obtener configuraciones del brand
      const { businessHours, specialHours } = await this.getBrandConfigurations(brandId);

      // Obtener todas las citas del mes
      const where: any = { 
        brandId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      };

      // Si no es ROOT, solo ver sus propias citas
      if (!isRoot) {
        where.clientId = userId;
      }

      const appointments = await this.prisma.appointment.findMany({
        where,
        orderBy: { startTime: 'asc' }
      });

      // Procesar días del mes
      const days: DayOccupancyDto[] = [];
      let totalBusinessMinutes = 0;
      let businessDaysCount = 0;

      for (let day = 1; day <= endDate.getDate(); day++) {
        const currentDate = new Date(year, monthNum - 1, day);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getUTCDay(); // Use UTC to match database timezone

        // Verificar si es día laborable
        const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
        const specialHour = specialHours.find(
          sh => sh.date.toISOString().split('T')[0] === dateStr
        );

        const isOpen = specialHour ? specialHour.isOpen : (businessHour?.isOpen || false);
        
        let availableMinutes = 0;
        if (isOpen) {
          const openTime = specialHour?.openTime || businessHour?.openTime;
          const closeTime = specialHour?.closeTime || businessHour?.closeTime;
          
          if (openTime && closeTime) {
            const [openHour, openMinute] = openTime.split(':').map(Number);
            const [closeHour, closeMinute] = closeTime.split(':').map(Number);
            availableMinutes = (closeHour * 60 + closeMinute) - (openHour * 60 + openMinute);
            totalBusinessMinutes += availableMinutes;
            businessDaysCount++;
          }
        }

        // Obtener citas del día
        const dayAppointments = appointments.filter(apt => 
          apt.startTime.toISOString().split('T')[0] === dateStr
        );

        // Calcular estadísticas del día
        const totalAppointments = dayAppointments.length;
        const confirmedAppointments = dayAppointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED).length;
        const pendingAppointments = dayAppointments.filter(apt => apt.status === AppointmentStatus.PENDING).length;
        const completedAppointments = dayAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
        const cancelledAppointments = dayAppointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length;
        const totalOccupiedMinutes = dayAppointments
          .filter(apt => apt.status !== AppointmentStatus.CANCELLED)
          .reduce((sum, apt) => sum + apt.duration, 0);

        const occupancyPercentage = availableMinutes > 0 ? (totalOccupiedMinutes / availableMinutes) * 100 : 0;

        days.push({
          date: dateStr,
          totalAppointments,
          confirmedAppointments,
          pendingAppointments,
          completedAppointments,
          cancelledAppointments,
          totalOccupiedMinutes,
          totalAvailableMinutes: availableMinutes,
          occupancyPercentage: Math.round(occupancyPercentage * 100) / 100,
          isBusinessOpen: isOpen
        });
      }

      // Calcular resumen del mes
      const totalAppointments = appointments.length;
      const confirmedAppointments = appointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED).length;
      const pendingAppointments = appointments.filter(apt => apt.status === AppointmentStatus.PENDING).length;
      const completedAppointments = appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
      const cancelledAppointments = appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length;
      const totalOccupiedMinutes = appointments
        .filter(apt => apt.status !== AppointmentStatus.CANCELLED)
        .reduce((sum, apt) => sum + apt.duration, 0);

      const averageOccupancyPercentage = totalBusinessMinutes > 0 ? 
        (totalOccupiedMinutes / totalBusinessMinutes) * 100 : 0;

      const daysWithAppointments = days.filter(day => day.totalAppointments > 0).length;

      const summary: MonthSummaryDto = {
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalOccupiedMinutes,
        totalAvailableMinutes: totalBusinessMinutes,
        averageOccupancyPercentage: Math.round(averageOccupancyPercentage * 100) / 100,
        businessDaysInMonth: businessDaysCount,
        daysWithAppointments
      };

      const response: CalendarMonthResponseDto = {
        month,
        summary,
        days
      };

      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error getting calendar month:', error);
      throw error;
    }
  }

  // Get complete day agenda with appointments and available slots
  async getDayAgenda(
    brandId: number,
    date: string,
    userId: number,
    query: GetDayAgendaQueryDto = {}
  ): Promise<BaseResponseDto<DayAgendaDto>> {
    try {
      // Validate brand access - user must be owner or client of this brand
      const hasAccess = await this.validateBrandAccess(brandId, userId);
      if (!hasAccess) {
        throw new ForbiddenException('No tiene acceso a este brand');
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      const targetDate = new Date(date + 'T00:00:00Z'); // Force UTC to match database
      const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
      const includeCancelled = query.includeCancelled || false;

      // Get brand settings for slot duration
      const brandSettings = await this.prisma.appointmentSettings.findUnique({
        where: { brandId }
      });
      const slotDuration = brandSettings?.defaultDuration || 30;

      // Check user role for cancelled appointments access
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        select: { ownerId: true }
      });
      
      const userBrand = await this.prisma.userBrand.findFirst({
        where: { brandId, userId, isActive: true },
        include: { user: { select: { role: true } } }
      });
      
      const isOwner = brand?.ownerId === userId;
      const isAdminOrRoot = userBrand?.user.role === 'ROOT' || userBrand?.user.role === 'ADMIN' || isOwner;

      // Only ROOT, ADMIN or brand owner can see cancelled appointments
      const shouldIncludeCancelled = isAdminOrRoot && includeCancelled;

      // Get business hours for the day (including special hours check)
      const businessHours = await this.getBusinessHoursForDay(brandId, dayOfWeek, date);
      
      // If business is closed, return empty agenda
      if (businessHours.isClosed) {
        const emptyAgenda: DayAgendaDto = {
          date,
          businessHours,
          agenda: [],
          totalAppointments: 0,
          totalAvailableSlots: 0,
          slotDuration,
          totalAvailableTime: 0,
          totalBookedTime: 0
        };
        return BaseResponseDto.success(emptyAgenda);
      }

      // Get appointments for the day
      const startOfDay = new Date(`${date}T00:00:00Z`);
      const endOfDay = new Date(`${date}T23:59:59Z`);

      // Filter appointment statuses based on user permissions
      const appointmentStatuses = shouldIncludeCancelled 
        ? Object.values(AppointmentStatus)
        : Object.values(AppointmentStatus).filter(status => status !== AppointmentStatus.CANCELLED);

      const appointments = await this.prisma.appointment.findMany({
        where: {
          brandId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: appointmentStatuses
          }
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
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
        orderBy: {
          startTime: 'asc'
        }
      });

      // Generate complete agenda
      const agenda = this.generateDayAgenda(
        businessHours,
        appointments.map(apt => this.mapToDto(apt)),
        date,
        slotDuration
      );

      // Calculate statistics
      const totalAppointments = appointments.length;
      const totalAvailableSlots = agenda.filter(slot => slot.type === AgendaSlotType.AVAILABLE).length;
      const totalBookedTime = agenda
        .filter(slot => slot.type === AgendaSlotType.APPOINTMENT)
        .reduce((total, slot) => total + slot.duration, 0);
      const totalAvailableTime = agenda
        .filter(slot => slot.type === AgendaSlotType.AVAILABLE)
        .reduce((total, slot) => total + slot.duration, 0);

      const dayAgenda: DayAgendaDto = {
        date,
        businessHours,
        agenda,
        totalAppointments,
        totalAvailableSlots,
        slotDuration,
        totalAvailableTime,
        totalBookedTime
      };

      return BaseResponseDto.success(dayAgenda);
    } catch (error) {
      console.error('Error getting day agenda:', error);
      throw error;
    }
  }

  // Helper method to check if business is open on a specific date
  async isBusinessOpenOnDate(brandId: number, date: string): Promise<boolean> {
    const targetDate = new Date(date + 'T00:00:00Z'); // Force UTC
    const dayOfWeek = targetDate.getUTCDay(); // Use UTC to match database timezone
    
    const businessHours = await this.getBusinessHoursForDay(brandId, dayOfWeek, date);
    return !businessHours.isClosed;
  }

  // Get business hours for a specific date (considers special hours and regular business hours)
  private async getBusinessHoursForDay(brandId: number, dayOfWeek: number, date?: string): Promise<BusinessHoursDto> {
    // First check for special hours if date is provided
    if (date) {
      const specialHours = await this.prisma.specialHours.findFirst({
        where: {
          brandId,
          date: new Date(`${date}T00:00:00.000Z`)
        }
      });

      // Special hours override regular business hours
      if (specialHours) {
        if (!specialHours.isOpen) {
          return {
            start: '00:00',
            end: '00:00',
            isClosed: true
          };
        }

        // Validate special hours configuration
        if (!specialHours.openTime || !specialHours.closeTime) {
          console.warn(`Brand ${brandId} has incomplete special hours configuration for date ${date}`);
          return {
            start: '00:00',
            end: '00:00',
            isClosed: true
          };
        }

        return {
          start: specialHours.openTime,
          end: specialHours.closeTime,
          isClosed: false
        };
      }
    }

    // Fall back to regular business hours
    const businessHours = await this.prisma.businessHours.findFirst({
      where: {
        brandId,
        dayOfWeek
      }
    });

    // If no business hours configured or closed, return closed
    if (!businessHours || !businessHours.isOpen) {
      return {
        start: '00:00',
        end: '00:00',
        isClosed: true
      };
    }

    // Validate that business hours are properly configured
    if (!businessHours.openTime || !businessHours.closeTime) {
      console.warn(`Brand ${brandId} has incomplete business hours configuration for day ${dayOfWeek}`);
      return {
        start: '00:00',
        end: '00:00',
        isClosed: true
      };
    }

    return {
      start: businessHours.openTime,
      end: businessHours.closeTime,
      isClosed: false
    };
  }

  // Generate complete day agenda with appointments and available slots
  private generateDayAgenda(
    businessHours: BusinessHoursDto,
    appointments: AppointmentDto[],
    date: string,
    slotDuration: number
  ): AgendaSlotDto[] {
    const agenda: AgendaSlotDto[] = [];

    if (businessHours.isClosed) {
      return agenda;
    }

    // Generate all possible time slots using utils
    const allTimeSlots = AppointmentUtils.generateTimeSlots(
      businessHours.start,
      businessHours.end,
      slotDuration
    );

    // Convert appointments to a more efficient format for conflict checking
    const appointmentBlocks = appointments.map(apt => {
      const start = new Date(apt.startTime);
      const end = new Date(apt.endTime);
      return {
        startMinutes: start.getUTCHours() * 60 + start.getUTCMinutes(),
        endMinutes: end.getUTCHours() * 60 + end.getUTCMinutes(),
        appointment: apt
      };
    }).sort((a, b) => a.startMinutes - b.startMinutes);

    // Process each time slot
    let appointmentIndex = 0;
    
    for (let i = 0; i < allTimeSlots.length; i++) {
      const slotTime = allTimeSlots[i];
      const slotStartMinutes = AppointmentUtils.timeToMinutes(slotTime);
      const slotEndMinutes = slotStartMinutes + slotDuration;

      // Check if this slot has an appointment
      const appointmentAtSlot = appointmentBlocks.find(apt => 
        apt.startMinutes === slotStartMinutes
      );

      if (appointmentAtSlot) {
        // Add appointment slot
        const aptDuration = appointmentAtSlot.endMinutes - appointmentAtSlot.startMinutes;
        
        agenda.push({
          startTime: AppointmentUtils.minutesToTime(appointmentAtSlot.startMinutes),
          endTime: AppointmentUtils.minutesToTime(appointmentAtSlot.endMinutes),
          type: AgendaSlotType.APPOINTMENT,
          appointment: appointmentAtSlot.appointment,
          duration: aptDuration,
          isBookable: false
        });

        // Skip slots that overlap with this appointment
        const slotsToSkip = Math.ceil(aptDuration / slotDuration) - 1;
        i += slotsToSkip;
      } else {
        // Check if this slot conflicts with any appointment
        const hasConflict = appointmentBlocks.some(apt =>
          AppointmentUtils.hasTimeConflict(
            { startTime: new Date(), endTime: new Date() }, // Dummy dates, we use minutes
            { startTime: new Date(), endTime: new Date() }
          ) || (
            apt.startMinutes < slotEndMinutes && apt.endMinutes > slotStartMinutes
          )
        );

        if (!hasConflict) {
          // Calculate available slot duration (might extend beyond standard slot)
          let availableEndMinutes = slotEndMinutes;
          
          // Find next appointment to determine max available time
          const nextAppointment = appointmentBlocks.find(apt => 
            apt.startMinutes >= slotEndMinutes
          );
          
          if (nextAppointment) {
            const businessEndMinutes = AppointmentUtils.timeToMinutes(businessHours.end);
            const maxPossibleEnd = Math.min(nextAppointment.startMinutes, businessEndMinutes);
            
            // Extend the slot if we have more time available
            if (maxPossibleEnd > availableEndMinutes) {
              availableEndMinutes = maxPossibleEnd;
            }
          } else {
            // No more appointments, extend to business hours end
            availableEndMinutes = AppointmentUtils.timeToMinutes(businessHours.end);
          }

          const availableDuration = availableEndMinutes - slotStartMinutes;
          
          // Only add slot if it's meaningful (use constant from utils)
          if (availableDuration >= APPOINTMENT_CONSTANTS.DURATION.MIN) {
            agenda.push({
              startTime: slotTime,
              endTime: AppointmentUtils.minutesToTime(availableEndMinutes),
              type: AgendaSlotType.AVAILABLE,
              duration: availableDuration,
              isBookable: availableDuration >= slotDuration
            });

            // Skip overlapping slots if this is a larger block
            if (availableDuration > slotDuration) {
              const slotsToSkip = Math.floor(availableDuration / slotDuration) - 1;
              i += slotsToSkip;
            }
          }
        }
      }
    }

    return agenda;
  }

  // Mapear entidad a DTO
  private mapToDto(appointment: any): AppointmentDto {
    return {
      id: appointment.id,
      brandId: appointment.brandId,
      clientId: appointment.clientId,
      serviceTypeId: appointment.serviceTypeId, // Agregar este campo
      serviceType: appointment.serviceType ? { // Agregar información completa del servicio
      id: appointment.serviceType.id,
      name: appointment.serviceType.name,
      description: appointment.serviceType.description,
      duration: appointment.serviceType.duration,
      price: appointment.serviceType.price ? Number(appointment.serviceType.price) : undefined,
      color: appointment.serviceType.color,
      icon: appointment.serviceType.icon
    } : undefined,
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
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentStatus, UserRole } from 'generated/prisma'; 
import { 
  VALID_STATUS_TRANSITIONS,
  STATUS_CHANGE_REASONS_REQUIRED,
  FINAL_STATUSES,
  CANCELLATION_MIN_HOURS,
  STATUS_TRANSITION_PERMISSIONS
} from './appointment-status.constants';
import { 
  StatusTransitionDto, 
  TransitionValidationResultDto, 
  StatusHistoryDto, 
  StatusStatisticsDto 
} from './dto/status-transition.dto';

export interface StatusTransitionContext {
  appointmentId: number;
  currentStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  userId: number;
  userRole: UserRole;
  brandId: number;
  isOwner: boolean;
  reason?: string;
  notes?: string;
  rescheduleDateTime?: Date;
  notifyClient?: boolean;
}

@Injectable()
export class AppointmentStatusManagerService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  /**
   * Valida si una transición de estado es válida
   */
  async validateTransition(
    appointmentId: number,
    newStatus: AppointmentStatus,
    userId: number
  ): Promise<TransitionValidationResultDto> {
    // Obtener la cita con toda la información necesaria
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        brand: {
          include: {
            appointmentSettings: true
          }
        },
        client: true
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    const currentStatus = appointment.status;
    const result: TransitionValidationResultDto = {
      isValid: true,
      allowedTransitions: VALID_STATUS_TRANSITIONS[currentStatus] || [],
      warnings: []
    };

    // Verificar si es el mismo estado
    if (currentStatus === newStatus) {
      return {
        ...result,
        isValid: false,
        errorMessage: 'La cita ya está en este estado'
      };
    }

    // Verificar si es un estado final
    if (FINAL_STATUSES.includes(currentStatus)) {
      return {
        ...result,
        isValid: false,
        errorMessage: `No se pueden hacer cambios desde el estado ${currentStatus}`
      };
    }

    // Verificar transiciones válidas
    if (!result.allowedTransitions.includes(newStatus)) {
      return {
        ...result,
        isValid: false,
        errorMessage: `No se puede cambiar de ${currentStatus} a ${newStatus}`
      };
    }

    // Verificar campos requeridos
    const requiredFields: string[] = [];
    
    if (STATUS_CHANGE_REASONS_REQUIRED.includes(newStatus)) {
      requiredFields.push('reason');
    }

    // Advertencias para mejores prácticas
    if (newStatus === AppointmentStatus.CANCELLED) {
      const hoursUntil = this.getHoursUntilAppointment(appointment.startTime);
      if (hoursUntil < CANCELLATION_MIN_HOURS && hoursUntil >= 0) {
        result.warnings?.push(
          `Cancelación con menos de ${CANCELLATION_MIN_HOURS} horas de anticipación`
        );
      }
    }

    if (requiredFields.length > 0) {
      result.requiredFields = requiredFields;
    }

    return result;
  }

  /**
   * Ejecuta una transición de estado
   */
  async executeTransition(
    appointmentId: number,
    transitionDto: StatusTransitionDto,
    userId: number
  ): Promise<any> {
    return await this.prisma.$transaction(async (tx) => {
      // Obtener la cita con bloqueo para evitar condiciones de carrera
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          brand: true,
          client: true,
          createdBy: true,
          serviceType: true
        }
      });

      if (!appointment) {
        throw new NotFoundException('Cita no encontrada');
      }

      // Obtener información del usuario que hace el cambio
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          userBrands: {
            where: { brandId: appointment.brandId }
          }
        }
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const userRole = user.role;
      const isOwner = appointment.brand.ownerId === userId;
      const isClient = appointment.clientId === userId;

      // Crear contexto de transición
      const context: StatusTransitionContext = {
        appointmentId,
        currentStatus: appointment.status,
        newStatus: transitionDto.newStatus,
        userId,
        userRole,
        brandId: appointment.brandId,
        isOwner,
        reason: transitionDto.reason,
        notes: transitionDto.notes,
        rescheduleDateTime: transitionDto.rescheduleDateTime 
          ? new Date(transitionDto.rescheduleDateTime) 
          : undefined,
        notifyClient: transitionDto.notifyClient ?? true
      };

      // Validar la transición
      await this.validateTransitionWithContext(context);

      // Aplicar reglas de negocio
      await this.applyBusinessRules(context, appointment);

      // Actualizar el estado de la cita
      const updateData: any = {
        status: transitionDto.newStatus,
        updatedAt: new Date()
      };

      // Si es reprogramación, actualizar fechas
      if (transitionDto.rescheduleDateTime && transitionDto.newStatus === AppointmentStatus.PENDING) {
        const newStartTime = new Date(transitionDto.rescheduleDateTime);
        const duration = appointment.duration;
        updateData.startTime = newStartTime;
        updateData.endTime = new Date(newStartTime.getTime() + duration * 60000);
      }

      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: updateData,
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
          brand: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          serviceType: true,
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

      // Registrar en el historial
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          fromStatus: appointment.status,
          toStatus: transitionDto.newStatus,
          reason: transitionDto.reason,
          notes: transitionDto.notes,
          changedBy: userId,
          metadata: {
            userRole,
            isOwner,
            rescheduleDateTime: transitionDto.rescheduleDateTime,
            previousStartTime: appointment.startTime.toISOString()
          }
        }
      });

      // Emitir eventos para notificaciones y otras acciones
      if (context.notifyClient) {
        this.emitStatusChangeEvents(updatedAppointment, context);
      }

      return updatedAppointment;
    });
  }

  /**
   * Obtener historial de cambios de estado
   */
  async getStatusHistory(
    appointmentId: number,
    userId: number
  ): Promise<StatusHistoryDto[]> {
    // Verificar permisos
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { brand: true }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar acceso
    const hasAccess = await this.validateUserAccess(appointment, userId);
    if (!hasAccess) {
      throw new ForbiddenException('No tiene permisos para ver el historial de esta cita');
    }

    const history = await this.prisma.appointmentStatusHistory.findMany({
      where: { appointmentId },
      include: {
        changedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return history.map(h => ({
      id: h.id,
      appointmentId: h.appointmentId,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason || undefined,
      notes: h.notes || undefined,
      changedBy: {
        id: h.changedByUser.id,
        firstName: h.changedByUser.firstName,
        lastName: h.changedByUser.lastName || '',
        email: h.changedByUser.email,
        role: h.changedByUser.role
      },
      createdAt: h.createdAt.toISOString(),
      metadata: h.metadata as Record<string, any>
    }));
  }

  /**
   * Obtener estadísticas de estados
   */
  async getStatusStatistics(
    brandId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<StatusStatisticsDto> {
    const where: any = { brandId };
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    // Obtener distribución de estados
    const appointments = await this.prisma.appointment.findMany({
      where,
      select: { status: true }
    });

    const statusDistribution: Record<AppointmentStatus, number> = {
      [AppointmentStatus.PENDING]: 0,
      [AppointmentStatus.CONFIRMED]: 0,
      [AppointmentStatus.IN_PROGRESS]: 0,
      [AppointmentStatus.COMPLETED]: 0,
      [AppointmentStatus.CANCELLED]: 0,
      [AppointmentStatus.NO_SHOW]: 0
    };

    appointments.forEach(apt => {
      statusDistribution[apt.status]++;
    });

    const totalAppointments = appointments.length;
    const completedCount = statusDistribution[AppointmentStatus.COMPLETED];
    const cancelledCount = statusDistribution[AppointmentStatus.CANCELLED];
    const noShowCount = statusDistribution[AppointmentStatus.NO_SHOW];

    // Obtener razones de cancelación más comunes
    const cancellationReasons = await this.prisma.appointmentStatusHistory.groupBy({
      by: ['reason'],
      where: {
        toStatus: AppointmentStatus.CANCELLED,
        appointment: where,
        reason: { not: null }
      },
      _count: {
        reason: true
      },
      orderBy: {
        _count: {
          reason: 'desc'
        }
      },
      take: 5
    });

    const topCancellationReasons = cancellationReasons
      .filter(r => r.reason)
      .map(r => ({
        reason: r.reason!,
        count: r._count.reason,
        percentage: cancelledCount > 0 ? (r._count.reason / cancelledCount) * 100 : 0
      }));

    return {
      statusDistribution,
      cancellationRate: totalAppointments > 0 
        ? (cancelledCount / totalAppointments) * 100 
        : 0,
      completionRate: totalAppointments > 0 
        ? (completedCount / totalAppointments) * 100 
        : 0,
      noShowRate: totalAppointments > 0 
        ? (noShowCount / totalAppointments) * 100 
        : 0,
      topCancellationReasons,
      totalAppointments,
      dateRange: {
        startDate: startDate?.toISOString() || 'N/A',
        endDate: endDate?.toISOString() || 'N/A'
      }
    };
  }

  // Métodos privados auxiliares

  private async validateTransitionWithContext(context: StatusTransitionContext): Promise<void> {
    const validation = await this.validateTransition(
      context.appointmentId,
      context.newStatus,
      context.userId
    );

    if (!validation.isValid) {
      throw new BadRequestException({
        message: validation.errorMessage,
        requiredFields: validation.requiredFields,
        allowedTransitions: validation.allowedTransitions
      });
    }

    // Verificar campos requeridos
    if (validation.requiredFields?.includes('reason') && !context.reason) {
      throw new BadRequestException(
        `Se requiere una razón para cambiar al estado ${context.newStatus}`
      );
    }
  }

  private async applyBusinessRules(
    context: StatusTransitionContext, 
    appointment: any
  ): Promise<void> {
    // Regla: Solo ROOT/ADMIN pueden marcar como NO_SHOW
    if (context.newStatus === AppointmentStatus.NO_SHOW) {
      if (context.userRole !== UserRole.ROOT && !context.isOwner) {
        throw new ForbiddenException('Solo administradores pueden marcar citas como NO_SHOW');
      }
    }

    // Regla: No se puede iniciar una cita no confirmada
    if (context.newStatus === AppointmentStatus.IN_PROGRESS) {
      if (appointment.status !== AppointmentStatus.CONFIRMED) {
        throw new BadRequestException('Solo se pueden iniciar citas confirmadas');
      }
      
      // Solo ROOT/ADMIN pueden iniciar citas
      if (context.userRole !== UserRole.ROOT && !context.isOwner) {
        throw new ForbiddenException('Solo administradores pueden iniciar citas');
      }
    }

    // Regla: Validar tiempo mínimo para cancelación
    if (context.newStatus === AppointmentStatus.CANCELLED) {
      const hoursUntil = this.getHoursUntilAppointment(appointment.startTime);
      
      if (hoursUntil < CANCELLATION_MIN_HOURS && hoursUntil >= 0) {
        // Solo clientes tienen restricción de tiempo mínimo
        if (context.userRole === UserRole.CLIENT && !context.isOwner) {
          throw new BadRequestException(
            `Las citas deben cancelarse con al menos ${CANCELLATION_MIN_HOURS} horas de anticipación`
          );
        }
      }
    }

    // Regla: No se puede modificar una cita que ya pasó
    const now = new Date();
    if (appointment.endTime < now && context.newStatus !== AppointmentStatus.NO_SHOW) {
      throw new BadRequestException('No se puede modificar una cita que ya pasó');
    }
  }

  private async validateUserAccess(appointment: any, userId: number): Promise<boolean> {
    // Es el cliente de la cita
    if (appointment.clientId === userId) {
      return true;
    }

    // Es el dueño del brand
    if (appointment.brand.ownerId === userId) {
      return true;
    }

    // Es ROOT o ADMIN del brand
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId: appointment.brandId,
        userId,
        isActive: true
      },
      include: { user: true }
    });

    return userBrand?.user.role === UserRole.ROOT || userBrand?.user.role === UserRole.ADMIN;
  }

  private getHoursUntilAppointment(appointmentTime: Date): number {
    const now = new Date();
    const diffMs = appointmentTime.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  private emitStatusChangeEvents(appointment: any, context: StatusTransitionContext): void {
    // Registrar el cambio para futuras implementaciones de notificaciones
    console.log('Status changed:', {
      appointmentId: appointment.id,
      from: context.currentStatus,
      to: context.newStatus,
      changedBy: context.userId,
      reason: context.reason
    });

    // TODO: Implementar notificaciones cuando se configure el sistema de eventos
    // Por ejemplo: enviar email, SMS, webhook, etc.
    
    // Eventos específicos por tipo de cambio
    const eventMap = {
      [AppointmentStatus.CONFIRMED]: 'appointment.confirmed',
      [AppointmentStatus.CANCELLED]: 'appointment.cancelled',
      [AppointmentStatus.COMPLETED]: 'appointment.completed',
      [AppointmentStatus.NO_SHOW]: 'appointment.no_show',
      [AppointmentStatus.IN_PROGRESS]: 'appointment.started'
    };

    const specificEvent = eventMap[context.newStatus];
    if (specificEvent) {
      console.log(`Event triggered: ${specificEvent}`);
      // TODO: Aquí podrías llamar a un servicio de notificaciones
      // this.notificationService.send(specificEvent, { appointment, context });
    }
}
}
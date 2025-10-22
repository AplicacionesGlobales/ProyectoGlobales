// src/appointments/appointments.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';
import { Public } from '../common/decorators';
import {
  AppointmentDto,
  CreateAppointmentDto,
  CreateAppointmentByRootDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
  CancelAppointmentDto,
  GetAppointmentsQueryDto,
  AvailableTimeSlotsDto,
  CalculateAvailabilityDto,
  AvailabilityCalculationResultDto,
  TimeSlotDto,
  AppointmentStatus,
} from './dto/appointment.dto';
import {
  GetCalendarMonthDto,
  CalendarMonthResponseDto,
} from './dto/calendar-month.dto';
import { DayAgendaDto, GetDayAgendaQueryDto } from './dto/day-agenda.dto';
import {
  GetRealTimeSlotsDto,
  RealTimeSlotsResponseDto,
} from './dto/real-time-slots.dto';
import { AppointmentStatusManagerService } from './appointment-status-manager.service';
import {
  StatusTransitionDto,
  StatusHistoryDto,
} from './dto/status-transition.dto';

@ApiTags('Appointments Management')
@Controller('brand/:brandId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly statusManager: AppointmentStatusManagerService,
  ) {}

  // Endpoint para que clientes creen sus propias citas
  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cita como cliente',
    description: 'Permite a un cliente crear una cita para sí mismo',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Cita creada exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o horario no disponible',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con cita existente',
  })
  async createAppointment(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createData: CreateAppointmentDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.createAppointment(
      parseInt(brandId),
      createData,
      req.user.userId,
    );
  }

  // Endpoint exclusivo para ROOT - crear citas y asignar clientes
  @Post('appointments/admin')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cita como ROOT',
    description:
      'Permite al ROOT crear citas y asignarlas a clientes específicos o dejarlas sin asignar',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateAppointmentByRootDto })
  @ApiResponse({
    status: 201,
    description: 'Cita creada exitosamente por ROOT',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Solo ROOT puede usar este endpoint',
  })
  async createAppointmentByRoot(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createData: CreateAppointmentByRootDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.createAppointmentByRoot(
      parseInt(brandId),
      createData,
      req.user.userId,
    );
  }

  // Obtener citas (ROOT ve todas, clientes solo las suyas)
  @Get('appointments')
  //@UseGuards(BrandOwnerGuard)
  @ApiOperation({
    summary: 'Obtener citas',
    description:
      'ROOT ve todas las citas del brand, clientes solo ven sus propias citas',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha de inicio para filtrar (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha de fin para filtrar (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado de la cita',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filtrar por cliente (solo ROOT)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Citas obtenidas exitosamente',
    type: BaseResponseDto,
  })
  async getAppointments(
    @Param('brandId') brandId: string,
    @Query() query: any, // Use any to avoid strict validation
    @Request() req: any,
  ): Promise<
    BaseResponseDto<{
      appointments: AppointmentDto[];
      total: number;
      pages: number;
    }>
  > {
    // Transform query parameters manually
    const queryDto: GetAppointmentsQueryDto = {
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status,
      clientId: query.clientId ? parseInt(query.clientId) : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
    };

    return this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      queryDto,
    );
  }

  // Actualizar estado de cita
  @Put('appointments/:appointmentId/status')
  @ApiOperation({
    summary: 'Actualizar estado de cita',
    description:
      'Actualiza únicamente el estado de una cita existente. ROOT puede actualizar cualquier cita, clientes solo las suyas',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiBody({ type: UpdateAppointmentStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Estado de cita actualizado exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para actualizar esta cita',
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })
  async updateAppointmentStatus(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Body(ValidationPipe) updateData: UpdateAppointmentStatusDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.updateAppointmentStatus(
      parseInt(brandId),
      parseInt(appointmentId),
      updateData,
      req.user.userId,
    );
  }

  // Cancelar cita (actualizar status a CANCELLED)
  @Delete('appointments/:appointmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar cita',
    description: 'Cancela una cita cambiando su estado a CANCELLED',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Cita cancelada exitosamente',
    type: BaseResponseDto,
  })
  async cancelAppointment(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.updateAppointmentStatus(
      parseInt(brandId),
      parseInt(appointmentId),
      { status: 'CANCELLED' as any, notes: 'Cita cancelada' },
      req.user.userId,
    );
  }

  // NUEVO: Cancelar cita con notificación automática al cliente
  @Post('appointments/:appointmentId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar cita con notificación',
    description:
      'Cancela una cita con motivo específico y envía notificación automática por email al cliente',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiBody({ type: CancelAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Cita cancelada exitosamente y notificación enviada',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La cita ya está cancelada o datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para cancelar esta cita',
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })
  async cancelAppointmentWithNotification(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Body(ValidationPipe) cancelData: CancelAppointmentDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.cancelAppointmentWithNotification(
      parseInt(brandId),
      parseInt(appointmentId),
      cancelData,
      req.user.userId,
    );
  }

  // Obtener horarios disponibles para una fecha
  @Get('appointments/availability/slots')
  @ApiOperation({
    summary: 'Obtener horarios disponibles',
    description: 'Retorna los horarios disponibles para una fecha específica',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Fecha para consultar disponibilidad (YYYY-MM-DD)',
    example: '2024-08-20',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    description: 'Duración deseada en minutos',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios disponibles obtenidos exitosamente',
    type: BaseResponseDto,
  })
  async getAvailableTimeSlots(
    @Param('brandId') brandId: string,
    @Query(ValidationPipe) query: AvailableTimeSlotsDto,
  ): Promise<BaseResponseDto<TimeSlotDto[]>> {
    return this.appointmentsService.getAvailableTimeSlots(
      parseInt(brandId),
      query,
    );
  }

  // Endpoint adicional para ROOT - obtener estadísticas de citas
  @Get('appointments/statistics/summary')
  @UseGuards(BrandOwnerGuard)
  @ApiOperation({
    summary: 'Obtener estadísticas de citas (solo ROOT)',
    description: 'Retorna un resumen estadístico de las citas del brand',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha de inicio para el reporte (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha de fin para el reporte (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getAppointmentStatistics(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ): Promise<BaseResponseDto<any>> {
    // Esta funcionalidad se puede implementar posteriormente
    return BaseResponseDto.success({
      message: 'Estadísticas no implementadas aún',
      totalAppointments: 0,
      byStatus: {},
      byMonth: {},
    });
  }

  // Obtener citas para una fecha específica
  @Get('appointments/date/:date')
  @ApiOperation({
    summary: 'Obtener citas por fecha',
    description: 'Obtiene todas las citas de una fecha específica',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'date',
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2025-08-19',
  })
  @ApiResponse({
    status: 200,
    description: 'Citas obtenidas exitosamente',
    type: BaseResponseDto,
  })
  async getAppointmentsByDate(
    @Param('brandId') brandId: string,
    @Param('date') date: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto[]>> {
    const query: GetAppointmentsQueryDto = {
      startDate: date,
      endDate: date,
      page: 1,
      limit: 100,
    };

    const result = await this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      query,
    );

    return BaseResponseDto.success(result.data?.appointments || []);
  }

  // Obtener resumen mensual del calendario
  @Get('calendar/month/:month')
  @ApiOperation({
    summary: 'Obtener resumen de ocupación mensual',
    description:
      'Retorna un resumen de ocupación y citas para un mes completo con estadísticas diarias y mensuales',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'month',
    description: 'Mes en formato YYYY-MM',
    example: '2024-08',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen mensual obtenido exitosamente',
    type: BaseResponseDto,
  })
  async getCalendarMonth(
    @Param('brandId') brandId: string,
    @Param('month') month: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<CalendarMonthResponseDto>> {
    return this.appointmentsService.getCalendarMonth(
      parseInt(brandId),
      month,
      req.user.userId,
    );
  }

  // Obtener citas para el calendario
  @Get('appointments/calendar')
  @ApiOperation({
    summary: 'Obtener citas para calendario',
    description:
      'Obtiene todas las citas en un rango de fechas para mostrar en el calendario',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Citas del calendario obtenidas exitosamente',
    type: BaseResponseDto,
  })
  async getCalendarAppointments(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto[]>> {
    const query: GetAppointmentsQueryDto = {
      startDate,
      endDate,
      page: 1,
      limit: 1000, // Allow more appointments for calendar view
    };

    const result = await this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      query,
    );

    // El servicio ya devuelve BaseResponseDto, extraemos los appointments
    if (result.success && result.data) {
      return BaseResponseDto.success(result.data.appointments || []);
    } else {
      throw new Error('Error al obtener las citas del calendario');
    }
  }

  // Get complete day agenda with appointments and available slots
  @Get('calendar/today/agenda')
  @UseGuards(JwtAuthGuard) // Requiere autenticación
  @ApiOperation({
    summary: 'Obtener agenda completa del día actual',
    description:
      'Retorna la agenda del día actual con citas programadas y espacios disponibles. Solo accesible para miembros del brand.',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'includeCancelled',
    required: false,
    description: 'Incluir citas canceladas (solo para dueños)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Agenda del día obtenida exitosamente',
    type: BaseResponseDto,
  })
  async getTodayAgenda(
    @Param('brandId') brandId: string,
    @Query(ValidationPipe) query: GetDayAgendaQueryDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<DayAgendaDto>> {
    // Always use current date
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user?.sub || req.user?.userId;
    return this.appointmentsService.getDayAgenda(
      parseInt(brandId),
      today,
      userId,
      query,
    );
  }

  // Get complete day agenda for any specific date
  @Get('calendar/date/:date/agenda')
  @UseGuards(JwtAuthGuard) // Requiere autenticación
  @ApiOperation({
    summary: 'Obtener agenda completa para una fecha específica',
    description:
      'Retorna la agenda de una fecha específica con citas programadas y espacios disponibles. Solo accesible para miembros del brand.',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'date',
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-08-20',
  })
  @ApiQuery({
    name: 'includeCancelled',
    required: false,
    description: 'Incluir citas canceladas (solo para dueños)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Agenda de la fecha específica obtenida exitosamente',
    type: BaseResponseDto,
  })
  async getDateAgenda(
    @Param('brandId') brandId: string,
    @Param('date') date: string,
    @Query(ValidationPipe) query: GetDayAgendaQueryDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<DayAgendaDto>> {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }

    const userId = req.user?.sub || req.user?.userId;
    return this.appointmentsService.getDayAgenda(
      parseInt(brandId),
      date,
      userId,
      query,
    );
  }

  // NUEVO: Actualizar información completa de cita (solo ROOT/ADMIN)
  @Put('appointments/:appointmentId/admin-edit')
  @UseGuards(BrandOwnerGuard) // Solo ROOT/ADMIN
  @ApiOperation({
    summary: 'Editar cita completa',
    description:
      'Permite al ROOT/ADMIN modificar fecha, hora, cliente, servicio y duración de una cita.',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Cita actualizada exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Solo ROOT/ADMIN puede usar este endpoint',
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con horario existente o fuera de horario laboral',
  })
  async updateAppointmentAdmin(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Body(ValidationPipe) updateData: UpdateAppointmentDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.updateAppointmentAdmin(
      parseInt(brandId),
      parseInt(appointmentId),
      updateData,
      req.user.userId,
    );
  }

  // NUEVO: Obtener slots disponibles en tiempo real por tipo de servicio
  @Get('appointments/real-time-slots')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener slots disponibles en tiempo real',
    description:
      'Retorna los slots disponibles para una fecha específica con soporte para tipos de servicio específicos y configuraciones personalizables. Ideal para sistemas de booking en tiempo real.',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Fecha para consultar disponibilidad (YYYY-MM-DD)',
    example: '2024-08-20',
  })
  @ApiQuery({
    name: 'serviceTypeId',
    required: false,
    description:
      'ID del tipo de servicio específico. Si no se proporciona, se muestran todos los tipos activos',
    example: 123,
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    description:
      'Duración personalizada en minutos. Sobrescribe la duración del tipo de servicio',
    example: 45,
  })
  @ApiQuery({
    name: 'slotInterval',
    required: false,
    description: 'Intervalo entre slots en minutos (default: 15)',
    example: 15,
  })
  @ApiQuery({
    name: 'onlyFullSlots',
    required: false,
    description:
      'Solo mostrar slots que puedan acomodar completamente el servicio (default: true)',
    example: true,
  })
  @ApiQuery({
    name: 'startTime',
    required: false,
    description: 'Hora de inicio para filtrar slots (HH:mm)',
    example: '09:00',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    description: 'Hora de fin para filtrar slots (HH:mm)',
    example: '17:00',
  })
  @ApiResponse({
    status: 200,
    description: 'Slots en tiempo real obtenidos exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de servicio no encontrado',
  })
  async getRealTimeSlots(
    @Param('brandId') brandId: string,
    @Query() query: any,
    @Request() req: any,
  ): Promise<BaseResponseDto<RealTimeSlotsResponseDto>> {
    // Transform and validate query parameters
    const realTimeSlotsQuery: GetRealTimeSlotsDto = {
      date: query.date,
      serviceTypeId: query.serviceTypeId
        ? parseInt(query.serviceTypeId)
        : undefined,
      duration: query.duration ? parseInt(query.duration) : undefined,
      slotInterval: query.slotInterval ? parseInt(query.slotInterval) : 15,
      onlyFullSlots: query.onlyFullSlots !== 'false', // Default to true unless explicitly false
      startTime: query.startTime,
      endTime: query.endTime,
    };

    // Basic validation
    if (!realTimeSlotsQuery.date) {
      throw new BadRequestException('El parámetro date es requerido');
    }

    const userId = req.user?.sub || req.user?.userId;
    return this.appointmentsService.getRealTimeSlots(
      parseInt(brandId),
      realTimeSlotsQuery,
      userId,
    );
  }

  // Obtener una cita específica (DEBE IR AL FINAL para evitar conflictos de rutas)
  @Get('appointments/:appointmentId')
  @ApiOperation({
    summary: 'Obtener cita específica',
    description: 'Obtiene los detalles de una cita específica',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Cita obtenida exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })
  async getAppointment(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.getAppointmentById(
      parseInt(brandId),
      parseInt(appointmentId),
      req.user.userId,
    );
  }

  // Obtener transiciones válidas para una cita
  @Get('appointments/:appointmentId/transitions')
  @ApiOperation({
    summary: 'Obtener transiciones de estado disponibles',
    description: 'Retorna las transiciones de estado válidas para una cita',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Transiciones válidas obtenidas',
    type: BaseResponseDto,
  })
  async getValidTransitions(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<any>> {
    const validation = await this.statusManager.validateTransition(
      parseInt(appointmentId),
      AppointmentStatus.PENDING, // dummy status para obtener todas las transiciones
      req.user.userId,
    );

    return BaseResponseDto.success(validation);
  }

  // Obtener historial de cambios de estado
  @Get('appointments/:appointmentId/status-history')
  @ApiOperation({
    summary: 'Obtener historial de cambios de estado',
    description:
      'Retorna el historial completo de cambios de estado de una cita',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID de la cita',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
    type: BaseResponseDto,
  })
  async getStatusHistory(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<StatusHistoryDto[]>> {
    const history = await this.statusManager.getStatusHistory(
      parseInt(appointmentId),
      req.user.userId,
    );

    return BaseResponseDto.success(history);
  }

  // Obtener estadísticas de estados (solo ROOT)
  @Get('appointments/statistics/status')
  @UseGuards(BrandOwnerGuard)
  @ApiOperation({
    summary: 'Obtener estadísticas de estados',
    description: 'Retorna estadísticas sobre estados de citas (solo ROOT)',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas',
    type: BaseResponseDto,
  })
  async getStatusStatistics(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BaseResponseDto<any>> {
    const statistics = await this.statusManager.getStatusStatistics(
      parseInt(brandId),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return BaseResponseDto.success(statistics);
  }

  // TASK-024B#: Cálculo de disponibilidad
  @Get('availability/calculate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Calcular disponibilidad completa para una fecha específica',
  })
  @ApiParam({
    name: 'brandId',
    required: true,
    description: 'ID de la marca para calcular disponibilidad',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Fecha para calcular disponibilidad (YYYY-MM-DD)',
    example: '2024-08-20',
    type: String,
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    description:
      'Duración deseada en minutos (opcional, usa la configuración del negocio)',
    example: 30,
    type: Number,
  })
  @ApiQuery({
    name: 'includeUnavailable',
    required: false,
    description:
      'Incluir slots no disponibles en la respuesta (por defecto false)',
    example: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeReasons',
    required: false,
    description:
      'Incluir razones por las que un slot no está disponible (por defecto true)',
    example: true,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad calculada exitosamente',
    type: BaseResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Disponibilidad calculada exitosamente',
        data: {
          date: '2024-08-20',
          dayName: 'martes',
          isOpen: true,
          openTime: '09:00',
          closeTime: '18:00',
          slots: [
            {
              time: '09:00',
              available: true,
            },
            {
              time: '09:30',
              available: false,
              reason: 'Ocupado - Corte de Cabello (Juan Pérez)',
            },
          ],
          totalAvailableSlots: 24,
          totalOccupiedSlots: 3,
          totalSlots: 27,
          usedDuration: 30,
          calculatedAt: '2024-08-19T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos o configuración incompleta',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a esta marca',
  })
  @ApiResponse({
    status: 404,
    description: 'Marca no encontrada',
  })
  async calculateAvailability(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query(ValidationPipe) query: CalculateAvailabilityDto,
  ): Promise<BaseResponseDto<AvailabilityCalculationResultDto>> {
    return this.appointmentsService.calculateAvailability(brandId, query);
  }
}

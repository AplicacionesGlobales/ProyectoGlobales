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
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
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
  GetAppointmentsQueryDto,
  AvailableTimeSlotsDto,
  TimeSlotDto
} from './dto/appointment.dto';
import {
  GetCalendarMonthDto,
  CalendarMonthResponseDto
} from './dto/calendar-month.dto';
import {
  DayAgendaDto,
  GetDayAgendaQueryDto
} from './dto/day-agenda.dto';

@ApiTags('Appointments Management')
@Controller('brand/:brandId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Endpoint para que clientes creen sus propias citas
  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cita como cliente',
    description: 'Permite a un cliente crear una cita para sí mismo'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Cita creada exitosamente',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o horario no disponible'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con cita existente'
  })
  async createAppointment(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createData: CreateAppointmentDto,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.createAppointment(
      parseInt(brandId),
      createData,
      req.user.userId
    );
  }

  // Endpoint exclusivo para ROOT - crear citas y asignar clientes
  @Post('appointments/admin')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cita como ROOT',
    description: 'Permite al ROOT crear citas y asignarlas a clientes específicos o dejarlas sin asignar'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateAppointmentByRootDto })
  @ApiResponse({
    status: 201,
    description: 'Cita creada exitosamente por ROOT',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'Solo ROOT puede usar este endpoint'
  })
  async createAppointmentByRoot(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createData: CreateAppointmentByRootDto,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.createAppointmentByRoot(
      parseInt(brandId),
      createData,
      req.user.userId
    );
  }

  // Obtener citas (ROOT ve todas, clientes solo las suyas)
  @Get('appointments')
  @UseGuards(BrandOwnerGuard)
  @ApiOperation({
    summary: 'Obtener citas',
    description: 'ROOT ve todas las citas del brand, clientes solo ven sus propias citas'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: 'Fecha de inicio para filtrar (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: 'Fecha de fin para filtrar (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    description: 'Filtrar por estado de la cita' 
  })
  @ApiQuery({ 
    name: 'clientId', 
    required: false, 
    description: 'Filtrar por cliente (solo ROOT)' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Número de página',
    example: 1 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Elementos por página',
    example: 20 
  })
  @ApiResponse({
    status: 200,
    description: 'Citas obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getAppointments(
    @Param('brandId') brandId: string,
    @Query() query: any, // Use any to avoid strict validation
    @Request() req: any
  ): Promise<BaseResponseDto<{ appointments: AppointmentDto[], total: number, pages: number }>> {
    // Transform query parameters manually
    const queryDto: GetAppointmentsQueryDto = {
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status,
      clientId: query.clientId ? parseInt(query.clientId) : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20
    };

    return this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      queryDto
    );
  }

  // Obtener una cita específica
  @Get('appointments/:appointmentId')
  @ApiOperation({
    summary: 'Obtener cita específica',
    description: 'Obtiene los detalles de una cita específica'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'appointmentId', description: 'ID de la cita', example: 789 })
  @ApiResponse({
    status: 200,
    description: 'Cita obtenida exitosamente',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada'
  })
  async getAppointment(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto>> {
    // Esta funcionalidad se puede implementar si es necesaria
    // Por ahora, usar el endpoint de lista con filtros
    const query: GetAppointmentsQueryDto = { page: 1, limit: 1 };
    const result = await this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      query
    );
    
    if (!result.data || !result.data.appointments) {
      throw new Error('Cita no encontrada');
    }

    const appointment = result.data.appointments.find(
      apt => apt.id === parseInt(appointmentId)
    );
    
    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    
    return BaseResponseDto.success(appointment);
  }

  // Actualizar estado de cita
  @Put('appointments/:appointmentId/status')
  @ApiOperation({
    summary: 'Actualizar estado de cita',
    description: 'Actualiza únicamente el estado de una cita existente. ROOT puede actualizar cualquier cita, clientes solo las suyas'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'appointmentId', description: 'ID de la cita', example: 789 })
  @ApiBody({ type: UpdateAppointmentStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Estado de cita actualizado exitosamente',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para actualizar esta cita'
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada'
  })
  async updateAppointmentStatus(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Body(ValidationPipe) updateData: UpdateAppointmentStatusDto,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.updateAppointmentStatus(
      parseInt(brandId),
      parseInt(appointmentId),
      updateData,
      req.user.userId
    );
  }

  // Cancelar cita (actualizar status a CANCELLED)
  @Delete('appointments/:appointmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar cita',
    description: 'Cancela una cita cambiando su estado a CANCELLED'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'appointmentId', description: 'ID de la cita', example: 789 })
  @ApiResponse({
    status: 200,
    description: 'Cita cancelada exitosamente',
    type: BaseResponseDto
  })
  async cancelAppointment(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.updateAppointmentStatus(
      parseInt(brandId),
      parseInt(appointmentId),
      { status: 'CANCELLED' as any, notes: 'Cita cancelada' },
      req.user.userId
    );
  }

  // Obtener horarios disponibles para una fecha
  @Get('appointments/availability/slots')
  @ApiOperation({
    summary: 'Obtener horarios disponibles',
    description: 'Retorna los horarios disponibles para una fecha específica'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'date', 
    required: true, 
    description: 'Fecha para consultar disponibilidad (YYYY-MM-DD)',
    example: '2024-08-20'
  })
  @ApiQuery({ 
    name: 'duration', 
    required: false, 
    description: 'Duración deseada en minutos',
    example: 30
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios disponibles obtenidos exitosamente',
    type: BaseResponseDto
  })
  async getAvailableTimeSlots(
    @Param('brandId') brandId: string,
    @Query(ValidationPipe) query: AvailableTimeSlotsDto
  ): Promise<BaseResponseDto<TimeSlotDto[]>> {
    return this.appointmentsService.getAvailableTimeSlots(
      parseInt(brandId),
      query
    );
  }

  // Endpoint adicional para ROOT - obtener estadísticas de citas
  @Get('appointments/statistics/summary')
  @UseGuards(BrandOwnerGuard)
  @ApiOperation({
    summary: 'Obtener estadísticas de citas (solo ROOT)',
    description: 'Retorna un resumen estadístico de las citas del brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: 'Fecha de inicio para el reporte (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: 'Fecha de fin para el reporte (YYYY-MM-DD)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  async getAppointmentStatistics(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any
  ): Promise<BaseResponseDto<any>> {
    // Esta funcionalidad se puede implementar posteriormente
    return BaseResponseDto.success({
      message: 'Estadísticas no implementadas aún',
      totalAppointments: 0,
      byStatus: {},
      byMonth: {}
    });
  }

  // Obtener citas para una fecha específica
  @Get('appointments/date/:date')
  @ApiOperation({
    summary: 'Obtener citas por fecha',
    description: 'Obtiene todas las citas de una fecha específica'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'date', description: 'Fecha en formato YYYY-MM-DD', example: '2025-08-19' })
  @ApiResponse({
    status: 200,
    description: 'Citas obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getAppointmentsByDate(
    @Param('brandId') brandId: string,
    @Param('date') date: string,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto[]>> {
    const query: GetAppointmentsQueryDto = {
      startDate: date,
      endDate: date,
      page: 1,
      limit: 100
    };
    
    const result = await this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      query
    );
    
    return BaseResponseDto.success(result.data?.appointments || []);
  }

  // Obtener resumen mensual del calendario
  @Get('calendar/month/:month')
  @ApiOperation({
    summary: 'Obtener resumen de ocupación mensual',
    description: 'Retorna un resumen de ocupación y citas para un mes completo con estadísticas diarias y mensuales'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'month', description: 'Mes en formato YYYY-MM', example: '2024-08' })
  @ApiResponse({
    status: 200,
    description: 'Resumen mensual obtenido exitosamente',
    type: BaseResponseDto
  })
  async getCalendarMonth(
    @Param('brandId') brandId: string,
    @Param('month') month: string,
    @Request() req: any
  ): Promise<BaseResponseDto<CalendarMonthResponseDto>> {
    return this.appointmentsService.getCalendarMonth(
      parseInt(brandId),
      month,
      req.user.userId
    );
  }

  // Obtener citas para el calendario
  @Get('appointments/calendar')
  @ApiOperation({
    summary: 'Obtener citas para calendario',
    description: 'Obtiene todas las citas en un rango de fechas para mostrar en el calendario'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'startDate', 
    required: true, 
    description: 'Fecha de inicio (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: true, 
    description: 'Fecha de fin (YYYY-MM-DD)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Citas del calendario obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getCalendarAppointments(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto[]>> {
    const query: GetAppointmentsQueryDto = {
      startDate,
      endDate,
      page: 1,
      limit: 1000 // Allow more appointments for calendar view
    };
    
    const result = await this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      query
    );
    
    return BaseResponseDto.success(result.data?.appointments || []);
  }

  // Get complete day agenda with appointments and available slots
  @Get('calendar/today/agenda')
  @UseGuards(JwtAuthGuard) // Requiere autenticación
  @ApiOperation({
    summary: 'Obtener agenda completa del día actual',
    description: 'Retorna la agenda del día actual con citas programadas y espacios disponibles. Solo accesible para miembros del brand.'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'includeCancelled', 
    required: false, 
    description: 'Incluir citas canceladas (solo para dueños)',
    example: false
  })
  @ApiResponse({
    status: 200,
    description: 'Agenda del día obtenida exitosamente',
    type: BaseResponseDto
  })
  async getTodayAgenda(
    @Param('brandId') brandId: string,
    @Query(ValidationPipe) query: GetDayAgendaQueryDto,
    @Request() req: any
  ): Promise<BaseResponseDto<DayAgendaDto>> {
    // Always use current date
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user?.sub || req.user?.userId;
    return this.appointmentsService.getDayAgenda(
      parseInt(brandId),
      today,
      userId,
      query
    );
  }

  // Get complete day agenda for any specific date
  @Get('calendar/date/:date/agenda')
  @UseGuards(JwtAuthGuard) // Requiere autenticación
  @ApiOperation({
    summary: 'Obtener agenda completa para una fecha específica',
    description: 'Retorna la agenda de una fecha específica con citas programadas y espacios disponibles. Solo accesible para miembros del brand.'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'date', description: 'Fecha en formato YYYY-MM-DD', example: '2024-08-20' })
  @ApiQuery({ 
    name: 'includeCancelled', 
    required: false, 
    description: 'Incluir citas canceladas (solo para dueños)',
    example: false
  })
  @ApiResponse({
    status: 200,
    description: 'Agenda de la fecha específica obtenida exitosamente',
    type: BaseResponseDto
  })
  async getDateAgenda(
    @Param('brandId') brandId: string,
    @Param('date') date: string,
    @Query(ValidationPipe) query: GetDayAgendaQueryDto,
    @Request() req: any
  ): Promise<BaseResponseDto<DayAgendaDto>> {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    const userId = req.user?.sub || req.user?.userId;
    return this.appointmentsService.getDayAgenda(
      parseInt(brandId),
      date,
      userId,
      query
    );
  }
}
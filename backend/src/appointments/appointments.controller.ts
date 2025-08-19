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
  Request
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
import {
  AppointmentDto,
  CreateAppointmentDto,
  CreateAppointmentByRootDto,
  UpdateAppointmentDto,
  GetAppointmentsQueryDto,
  AvailableTimeSlotsDto,
  TimeSlotDto
} from './dto/appointment.dto';

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
    @Query(ValidationPipe) query: GetAppointmentsQueryDto,
    @Request() req: any
  ): Promise<BaseResponseDto<{ appointments: AppointmentDto[], total: number, pages: number }>> {
    return this.appointmentsService.getAppointments(
      parseInt(brandId),
      req.user.userId,
      query
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

  // Actualizar cita
  @Put('appointments/:appointmentId')
  @ApiOperation({
    summary: 'Actualizar cita',
    description: 'Actualiza una cita existente. ROOT puede actualizar cualquier cita, clientes solo las suyas'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'appointmentId', description: 'ID de la cita', example: 789 })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Cita actualizada exitosamente',
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
  async updateAppointment(
    @Param('brandId') brandId: string,
    @Param('appointmentId') appointmentId: string,
    @Body(ValidationPipe) updateData: UpdateAppointmentDto,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentDto>> {
    return this.appointmentsService.updateAppointment(
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
    return this.appointmentsService.updateAppointment(
      parseInt(brandId),
      parseInt(appointmentId),
      { status: 'CANCELLED' as any },
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
}
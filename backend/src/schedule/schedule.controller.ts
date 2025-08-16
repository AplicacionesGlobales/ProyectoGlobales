// src/schedule/schedule.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
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
import { ScheduleService } from './schedule.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';
import {
  BusinessHoursDto,
  UpdateBusinessHoursDto,
  SpecialHoursDto,
  CreateSpecialHoursDto,
  UpdateSpecialHoursDto,
  AppointmentSettingsDto,
  UpdateAppointmentSettingsDto
} from './dto/index';

@ApiTags('Schedule Management')
@Controller('brand/:brandId')
@UseGuards(JwtAuthGuard, BrandOwnerGuard)
@ApiBearerAuth()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Business Hours Endpoints
  @Get('business-hours')
  @ApiOperation({
    summary: 'Obtener horarios de negocio',
    description: 'Retorna los horarios regulares de operación para cada día de la semana'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiResponse({
    status: 200,
    description: 'Horarios de negocio obtenidos exitosamente',
    type: BaseResponseDto
  })
  async getBusinessHours(
    @Param('brandId') brandId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<BusinessHoursDto[]>> {
    return this.scheduleService.getBusinessHours(parseInt(brandId), req.user.userId);
  }

  @Put('business-hours')
  @ApiOperation({
    summary: 'Actualizar horarios de negocio',
    description: 'Actualiza los horarios regulares de operación para cada día de la semana'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: UpdateBusinessHoursDto })
  @ApiResponse({
    status: 200,
    description: 'Horarios de negocio actualizados exitosamente',
    type: BaseResponseDto
  })
  async updateBusinessHours(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) updateData: UpdateBusinessHoursDto,
    @Request() req: any
  ): Promise<BaseResponseDto<BusinessHoursDto[]>> {
    return this.scheduleService.updateBusinessHours(
      parseInt(brandId), 
      updateData, 
      req.user.userId
    );
  }

  // Special Hours Endpoints
  @Get('special-hours')
  @ApiOperation({
    summary: 'Obtener horarios especiales',
    description: 'Retorna los horarios especiales/excepciones configuradas'
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
  @ApiResponse({
    status: 200,
    description: 'Horarios especiales obtenidos exitosamente',
    type: BaseResponseDto
  })
  async getSpecialHours(
    @Param('brandId') brandId: string,
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<BaseResponseDto<SpecialHoursDto[]>> {
    return this.scheduleService.getSpecialHours(
      parseInt(brandId),
      startDate,
      endDate,
      req.user.userId
    );
  }

  @Post('special-hours')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear horario especial',
    description: 'Crea una nueva excepción en el horario regular (días festivos, vacaciones, etc.)'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateSpecialHoursDto })
  @ApiResponse({
    status: 201,
    description: 'Horario especial creado exitosamente',
    type: BaseResponseDto
  })
  async createSpecialHour(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createData: CreateSpecialHoursDto,
    @Request() req: any
  ): Promise<BaseResponseDto<SpecialHoursDto>> {
    return this.scheduleService.createSpecialHour(
      parseInt(brandId),
      createData,
      req.user.userId
    );
  }

  @Put('special-hours/:specialHourId')
  @ApiOperation({
    summary: 'Actualizar horario especial',
    description: 'Actualiza una excepción en el horario regular existente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'specialHourId', description: 'ID del horario especial', example: 789 })
  @ApiBody({ type: UpdateSpecialHoursDto })
  @ApiResponse({
    status: 200,
    description: 'Horario especial actualizado exitosamente',
    type: BaseResponseDto
  })
  async updateSpecialHour(
    @Param('brandId') brandId: string,
    @Param('specialHourId') specialHourId: string,
    @Body(ValidationPipe) updateData: UpdateSpecialHoursDto,
    @Request() req: any
  ): Promise<BaseResponseDto<SpecialHoursDto>> {
    return this.scheduleService.updateSpecialHour(
      parseInt(brandId),
      parseInt(specialHourId),
      updateData,
      req.user.userId
    );
  }

  @Delete('special-hours/:specialHourId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar horario especial',
    description: 'Elimina una excepción en el horario regular'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'specialHourId', description: 'ID del horario especial', example: 789 })
  @ApiResponse({
    status: 204,
    description: 'Horario especial eliminado exitosamente'
  })
  async deleteSpecialHour(
    @Param('brandId') brandId: string,
    @Param('specialHourId') specialHourId: string,
    @Request() req: any
  ): Promise<void> {
    await this.scheduleService.deleteSpecialHour(
      parseInt(brandId),
      parseInt(specialHourId),
      req.user.userId
    );
  }

  // Appointment Settings Endpoints
  @Get('appointment-settings')
  @ApiOperation({
    summary: 'Obtener configuración de citas',
    description: 'Retorna la configuración general para las citas'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiResponse({
    status: 200,
    description: 'Configuración de citas obtenida exitosamente',
    type: BaseResponseDto
  })
  async getAppointmentSettings(
    @Param('brandId') brandId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentSettingsDto>> {
    return this.scheduleService.getAppointmentSettings(
      parseInt(brandId),
      req.user.userId
    );
  }

  @Put('appointment-settings')
  @ApiOperation({
    summary: 'Actualizar configuración de citas',
    description: 'Actualiza la configuración general para las citas'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: UpdateAppointmentSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración de citas actualizada exitosamente',
    type: BaseResponseDto
  })
  async updateAppointmentSettings(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) updateData: UpdateAppointmentSettingsDto,
    @Request() req: any
  ): Promise<BaseResponseDto<AppointmentSettingsDto>> {
    return this.scheduleService.updateAppointmentSettings(
      parseInt(brandId),
      updateData,
      req.user.userId
    );
  }
}
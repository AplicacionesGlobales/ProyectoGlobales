// client/client-profile.controller.ts

import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ClientService } from './client.service';
import {
  UpdateClientProfileDto,
  ClientResponseDto,
  GetClientAppointmentsQueryDto,
  ClientAppointmentListResponseDto,
} from './dto';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientSelfAccessGuard } from '../common/guards/client-self-access.guard';

@ApiTags('Client Profile Management')
@Controller('brands/:brandId/profile')
@UseGuards(JwtAuthGuard, ClientSelfAccessGuard)
@ApiBearerAuth()
export class ClientProfileController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description:
      'Permite al cliente obtener su propio perfil en el brand específico',
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID del brand',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para acceder a este brand',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async getMyProfile(
    @Param('brandId') brandId: string,
    @Request() req: any,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    return this.clientService.getClient(
      parseInt(brandId),
      req.user.userId,
      req.user.userId, // El cliente actúa como owner de sí mismo para esta operación
    );
  }

  @Put()
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Permite al cliente actualizar su propio perfil en el brand específico',
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID del brand',
    example: 456,
  })
  @ApiBody({
    type: UpdateClientProfileDto,
    description: 'Datos del perfil a actualizar',
    examples: {
      example1: {
        summary: 'Actualización completa',
        value: {
          firstName: 'Juan Carlos',
          lastName: 'Pérez González',
          email: 'juan.nuevo@ejemplo.com',
          phone: '+50688889999',
        },
      },
      example2: {
        summary: 'Actualización parcial',
        value: {
          firstName: 'Juan Carlos',
          phone: '+50688889999',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para acceder a este brand',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ya está en uso por otro cliente',
  })
  async updateMyProfile(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) updateClientProfileDto: UpdateClientProfileDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    return this.clientService.updateClientProfile(
      parseInt(brandId),
      req.user.userId,
      updateClientProfileDto,
    );
  }

  @Get('appointments')
  @ApiOperation({
    summary: 'Obtener mi historial de citas',
    description:
      'Permite al cliente obtener su historial completo de citas en el brand específico con filtros y paginación',
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID del brand',
    example: 456,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha de inicio para filtrar (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha de fin para filtrar (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ],
    description: 'Filtrar por estado de la cita',
    example: 'COMPLETED',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['upcoming', 'past', 'today', 'all'],
    description:
      'Período de tiempo: upcoming (próximas), past (pasadas), today (hoy), all (todas)',
    example: 'all',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (empezando en 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de citas por página (máximo 50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de citas obtenido exitosamente',
    type: ClientAppointmentListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para acceder a este brand',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async getMyAppointments(
    @Param('brandId') brandId: string,
    @Query() queryFilters: GetClientAppointmentsQueryDto,
    @Request() req: any,
  ): Promise<BaseResponseDto<ClientAppointmentListResponseDto>> {
    return this.clientService.getClientAppointmentsHistory(
      parseInt(brandId),
      req.user.userId,
      queryFilters,
    );
  }
}

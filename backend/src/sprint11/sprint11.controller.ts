// src/sprint11/sprint11.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Sprint11Service } from './sprint11.service';
import { CreateLocationDto } from './dto';

@ApiTags('Appointment Locations')
@ApiBearerAuth()
@Controller('api')
export class Sprint11Controller {
  constructor(private readonly sprint11Service: Sprint11Service) { }

  /**
   * POST /api/appointments/:id/location
   * Crea una ubicación geográfica para una cita específica
   *
   * @param id - ID del appointment (cita) al que se le asociará la ubicación
   * @param createLocationDto - Datos de la ubicación (lat, lng, dirección)
   * @returns Ubicación creada con todos sus datos
   */
  @Post('appointments/:id/location')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear ubicación para una cita (Pablo)',
    description:
      'Crea una ubicación geográfica asociada a una cita específica. Solo puede ser creada por el cliente de la cita o usuarios del brand.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del appointment (cita)',
    example: 3,
    type: Number,
  })
  @ApiBody({
    type: CreateLocationDto,
    description: 'Datos de la ubicación geográfica',
    examples: {
      completo: {
        summary: 'Ejemplo completo',
        value: {
          latitude: 9.9281,
          longitude: -84.0907,
          address: 'Avenida Central, Calle 5',
          city: 'San José',
          country: 'Costa Rica',
          postalCode: '10101',
          notes: 'Oficina principal, segundo piso',
        },
      },
      minimo: {
        summary: 'Ejemplo mínimo (solo coordenadas)',
        value: {
          latitude: 9.9281,
          longitude: -84.0907,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ubicación creada exitosamente',
    schema: {
      example: {
        id: 1,
        appointmentId: 3,
        latitude: 9.9281,
        longitude: -84.0907,
        address: 'Avenida Central, Calle 5',
        city: 'San José',
        country: 'Costa Rica',
        postalCode: '10101',
        notes: 'Oficina principal, segundo piso',
        createdAt: '2025-10-20T22:30:00.000Z',
        updatedAt: '2025-10-20T22:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Coordenadas inválidas o datos incorrectos',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar esta cita',
  })
  @ApiResponse({
    status: 404,
    description: 'La cita no existe',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una ubicación para esta cita',
  })
  async createLocation(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() createLocationDto: CreateLocationDto,
    @Request() req: any,
  ) {
    return this.sprint11Service.createLocation(
      appointmentId,
      createLocationDto,
      req.user.userId,
    );
  }

  /**
   * GET /api/appointments/:id/location
   * Obtiene la ubicación asociada a una cita específica
   *
   * @param id - ID del appointment (cita) del cual obtener la ubicación
   * @returns Ubicación asociada al appointment
   */
  @Get('appointments/:id/location')
  @ApiOperation({
    summary: 'Obtener ubicación por ID de cita',
    description:
      'Obtiene la ubicación geográfica asociada a una cita específica mediante su appointment ID. (Pablo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del appointment (cita)',
    example: 3,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Ubicación encontrada',
    schema: {
      example: {
        id: 1,
        appointmentId: 3,
        latitude: 9.9281,
        longitude: -84.0907,
        address: 'Avenida Central, Calle 5',
        city: 'San José',
        country: 'Costa Rica',
        postalCode: '10101',
        notes: 'Oficina principal, segundo piso',
        createdAt: '2025-10-20T22:30:00.000Z',
        updatedAt: '2025-10-20T22:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para ver esta ubicación',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró ubicación para esta cita',
  })
  async getLocationByAppointmentId(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Request() req: any,
  ) {
    return this.sprint11Service.getLocationByAppointmentId(
      appointmentId,
      req.user.userId,
    );
  }

  /**
   * GET /api/locations/:id
   * Obtiene una ubicación por su ID único
   *
   * @param id - ID de la ubicación (location) a obtener
   * @returns Datos de la ubicación específica
   */
  @Get('locations/:id')
  @ApiOperation({
    summary: 'Obtener ubicación por ID de ubicación',
    description:
      'Obtiene una ubicación específica mediante su ID único de la tabla appointment_locations. (Pablo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ubicación (location)',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Ubicación encontrada',
    schema: {
      example: {
        id: 1,
        appointmentId: 3,
        latitude: 9.9281,
        longitude: -84.0907,
        address: 'Avenida Central, Calle 5',
        city: 'San José',
        country: 'Costa Rica',
        postalCode: '10101',
        notes: 'Oficina principal, segundo piso',
        createdAt: '2025-10-20T22:30:00.000Z',
        updatedAt: '2025-10-20T22:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para ver esta ubicación',
  })
  @ApiResponse({
    status: 404,
    description: 'Ubicación no encontrada',
  })
  async getLocationById(
    @Param('id', ParseIntPipe) locationId: number,
    @Request() req: any,
  ) {
    return this.sprint11Service.getLocationById(locationId, req.user.userId);
  }
}

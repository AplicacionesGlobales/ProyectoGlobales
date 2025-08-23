// client/client.controller.ts

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
import { ClientService } from './client.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientResponseDto,
  ClientListResponseDto,
  CheckEmailResponseDto,
  ClientStatsResponseDto,
  ImportClientsDto,
  ImportClientsResponseDto,
  ClientActivityResponseDto
} from './dto/index';

@ApiTags('Client Management')
@Controller('brands/:brandId/clients')
@UseGuards(JwtAuthGuard, BrandOwnerGuard)
@ApiBearerAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // === CLIENTES ===
  @Get()
  @ApiOperation({
    summary: 'Obtener lista de clientes',
    description: 'Lista todos los clientes del brand con paginación y filtros'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Elementos por página' })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    example: 'juan',
    description: 'Buscar por nombre, email o teléfono' 
  })
  @ApiQuery({ 
    name: 'active', 
    required: false, 
    example: 'true',
    description: 'Filtrar por estado activo (true/false/all)' 
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    example: 'createdAt',
    description: 'Campo para ordenar (createdAt, firstName, email, lastVisit)' 
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    example: 'desc',
    description: 'Orden de clasificación (asc/desc)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
    type: BaseResponseDto
  })
  async getClients(
    @Param('brandId') brandId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @Query('active') active: string = 'all',
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc',
    @Request() req: any
  ): Promise<BaseResponseDto<ClientListResponseDto>> {
    return this.clientService.listClients(
      parseInt(brandId),
      req.user.userId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        active: active === 'all' ? undefined : active === 'true',
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      }
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo cliente',
    description: 'Registra un nuevo cliente en el brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente',
    type: BaseResponseDto
  })
  async createClient(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createClientDto: CreateClientDto,
    @Request() req: any
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    return this.clientService.createClient(
      parseInt(brandId),
      createClientDto,
      req.user.userId
    );
  }

  @Get(':clientId')
  @ApiOperation({
    summary: 'Obtener información del cliente',
    description: 'Retorna información completa de un cliente específico'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Información del cliente obtenida exitosamente',
    type: BaseResponseDto
  })
  async getClient(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    return this.clientService.getClient(
      parseInt(brandId),
      parseInt(clientId),
      req.user.userId
    );
  }

  @Put(':clientId')
  @ApiOperation({
    summary: 'Actualizar información del cliente',
    description: 'Actualiza los datos de un cliente existente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente',
    type: BaseResponseDto
  })
  async updateClient(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
    @Request() req: any
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    return this.clientService.updateClient(
      parseInt(brandId),
      parseInt(clientId),
      updateClientDto,
      req.user.userId
    );
  }

  @Delete(':clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar cliente',
    description: 'Desactiva un cliente del brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiResponse({
    status: 204,
    description: 'Cliente eliminado exitosamente'
  })
  async deleteClient(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Request() req: any
  ): Promise<void> {
    await this.clientService.deleteClient(
      parseInt(brandId),
      parseInt(clientId),
      req.user.userId
    );
  }

  // === VALIDACIONES ===
  @Post('check-email')
  @ApiOperation({
    summary: 'Verificar disponibilidad de email',
    description: 'Verifica si un email está disponible para registro'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'cliente@ejemplo.com',
          description: 'Email a verificar'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Verificación completada',
    type: BaseResponseDto
  })
  async checkEmail(
    @Param('brandId') brandId: string,
    @Body('email') email: string,
    @Request() req: any
  ): Promise<BaseResponseDto<CheckEmailResponseDto>> {
    return this.clientService.checkEmailAvailability(
      parseInt(brandId),
      email,
      req.user.userId
    );
  }

  @Post('check-phone')
  @ApiOperation({
    summary: 'Verificar disponibilidad de teléfono',
    description: 'Verifica si un número de teléfono está disponible'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          example: '+50688887777',
          description: 'Teléfono a verificar'
        }
      },
      required: ['phone']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Verificación completada',
    type: BaseResponseDto
  })
  async checkPhone(
    @Param('brandId') brandId: string,
    @Body('phone') phone: string,
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.checkPhoneAvailability(
      parseInt(brandId),
      phone,
      req.user.userId
    );
  }

  // === ESTADÍSTICAS ===
  @Get(':clientId/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas del cliente',
    description: 'Retorna estadísticas de citas, pagos y actividad del cliente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    example: '30d',
    description: 'Período de tiempo (7d, 30d, 90d, 1y, all)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getClientStats(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Query('period') period: string = '30d',
    @Request() req: any
  ): Promise<BaseResponseDto<ClientStatsResponseDto>> {
    return this.clientService.getClientStatsDetailed(
      parseInt(brandId),
      parseInt(clientId),
      period,
      req.user.userId
    );
  }

  @Get('stats/top')
  @ApiOperation({
    summary: 'Obtener clientes más frecuentes',
    description: 'Lista los clientes con más citas y actividad'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    example: 10,
    description: 'Número de clientes a retornar'
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    example: '30d',
    description: 'Período de tiempo (7d, 30d, 90d, 1y, all)'
  })
  @ApiResponse({
    status: 200,
    description: 'Top clientes obtenidos exitosamente',
    type: BaseResponseDto
  })
  async getTopClients(
    @Param('brandId') brandId: string,
    @Query('limit') limit: string = '10',
    @Query('period') period: string = 'all',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.getTopClients(
      parseInt(brandId),
      parseInt(limit),
      period,
      req.user.userId
    );
  }

  @Get('stats/summary')
  @ApiOperation({
    summary: 'Obtener resumen de clientes',
    description: 'Retorna estadísticas generales de todos los clientes'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    example: '30d',
    description: 'Período de tiempo (7d, 30d, 90d, 1y)'
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen obtenido exitosamente',
    type: BaseResponseDto
  })
  async getClientsSummary(
    @Param('brandId') brandId: string,
    @Query('period') period: string = '30d',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.getClientsSummary(
      parseInt(brandId),
      period,
      req.user.userId
    );
  }

  // === IMPORTACIÓN/EXPORTACIÓN ===
  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Importar clientes en lote',
    description: 'Importa múltiples clientes desde un archivo CSV o JSON'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: ImportClientsDto })
  @ApiResponse({
    status: 201,
    description: 'Clientes importados exitosamente',
    type: BaseResponseDto
  })
  async importClients(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) importClientsDto: ImportClientsDto,
    @Request() req: any
  ): Promise<BaseResponseDto<ImportClientsResponseDto>> {
    return this.clientService.importClients(
      parseInt(brandId),
      importClientsDto,
      req.user.userId
    );
  }

  @Get('export')
  @ApiOperation({
    summary: 'Exportar clientes',
    description: 'Exporta la lista de clientes en formato CSV o JSON'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ 
    name: 'format', 
    required: false, 
    example: 'csv',
    description: 'Formato de exportación (csv/json)'
  })
  @ApiQuery({ 
    name: 'active', 
    required: false, 
    example: 'all',
    description: 'Filtrar por estado (all/true/false)'
  })
  @ApiResponse({
    status: 200,
    description: 'Datos exportados exitosamente',
    type: BaseResponseDto
  })
  async exportClients(
    @Param('brandId') brandId: string,
    @Query('format') format: string = 'csv',
    @Query('active') active: string = 'all',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.exportClients(
      parseInt(brandId),
      format,
      active === 'all' ? undefined : active === 'true',
      req.user.userId
    );
  }

  // === CITAS ===
  @Get(':clientId/appointments')
  @ApiOperation({
    summary: 'Obtener citas del cliente',
    description: 'Lista todas las citas del cliente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Elementos por página' })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    example: 'all',
    description: 'Filtrar por estado (all, pending, confirmed, completed, cancelled)'
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    example: 'upcoming',
    description: 'Período (upcoming, past, today, all)'
  })
  @ApiResponse({
    status: 200,
    description: 'Citas obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getClientAppointments(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status: string = 'all',
    @Query('period') period: string = 'all',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.getClientAppointments(
      parseInt(brandId),
      parseInt(clientId),
      {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        period
      },
      req.user.userId
    );
  }

  // === ACTIVIDAD ===
  @Get(':clientId/activity')
  @ApiOperation({
    summary: 'Obtener actividad del cliente',
    description: 'Lista la actividad reciente del cliente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Elementos por página' })
  @ApiResponse({
    status: 200,
    description: 'Actividad obtenida exitosamente',
    type: BaseResponseDto
  })
  async getClientActivity(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req: any
  ): Promise<BaseResponseDto<ClientActivityResponseDto>> {
    return this.clientService.getClientActivity(
      parseInt(brandId),
      parseInt(clientId),
      parseInt(page),
      parseInt(limit),
      req.user.userId
    );
  }

  // === NOTAS ===
  @Get(':clientId/notes')
  @ApiOperation({
    summary: 'Obtener notas del cliente',
    description: 'Lista todas las notas asociadas al cliente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Notas obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getClientNotes(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.getClientNotes(
      parseInt(brandId),
      parseInt(clientId),
      req.user.userId
    );
  }

  @Post(':clientId/notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar nota al cliente',
    description: 'Agrega una nueva nota al historial del cliente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        note: {
          type: 'string',
          example: 'Cliente prefiere citas en la mañana',
          description: 'Contenido de la nota'
        },
        isPrivate: {
          type: 'boolean',
          example: false,
          description: 'Si la nota es privada (solo visible para admins)'
        }
      },
      required: ['note']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Nota agregada exitosamente',
    type: BaseResponseDto
  })
  async addClientNote(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Body('note') note: string,
    @Body('isPrivate') isPrivate: boolean = false,
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.clientService.addClientNote(
      parseInt(brandId),
      parseInt(clientId),
      note,
      isPrivate,
      req.user.userId
    );
  }

  @Delete(':clientId/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar nota del cliente',
    description: 'Elimina una nota específica del cliente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'clientId', description: 'ID del cliente', example: 123 })
  @ApiParam({ name: 'noteId', description: 'ID de la nota', example: 789 })
  @ApiResponse({
    status: 204,
    description: 'Nota eliminada exitosamente'
  })
  async deleteClientNote(
    @Param('brandId') brandId: string,
    @Param('clientId') clientId: string,
    @Param('noteId') noteId: string,
    @Request() req: any
  ): Promise<void> {
    await this.clientService.deleteClientNote(
      parseInt(brandId),
      parseInt(clientId),
      parseInt(noteId),
      req.user.userId
    );
  }
}
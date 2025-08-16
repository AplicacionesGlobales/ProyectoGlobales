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
import { BrandService } from './brand.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOwnerGuard } from './guards/brand-owner.guard';
import {
  BrandAdminResponseDto,
  UpdateBrandDto,
  CreateBrandUserDto,
  UpdateBrandUserDto,
  BrandUserResponseDto,
  UpdateBrandPlanDto,
  BrandPlanResponseDto
} from './dto/index';

@ApiTags('Brand Administration')
@Controller('brand')
@UseGuards(JwtAuthGuard, BrandOwnerGuard)
@ApiBearerAuth()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get(':brandId')
  @ApiOperation({
    summary: 'Obtener información completa del brand',
    description: 'Retorna toda la información del brand incluyendo usuarios, features, plan, etc.'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiResponse({
    status: 200,
    description: 'Información del brand obtenida exitosamente',
    type: BaseResponseDto
  })
  async getBrandAdmin(
    @Param('brandId') brandId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    return this.brandService.getBrandAdminInfo(parseInt(brandId), req.user.userId);
  }

  @Put(':brandId')
  @ApiOperation({
    summary: 'Actualizar información del brand',
    description: 'Actualiza la información básica, colores, imágenes del brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({
    status: 200,
    description: 'Brand actualizado exitosamente',
    type: BaseResponseDto
  })
  async updateBrand(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) updateBrandDto: UpdateBrandDto,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    return this.brandService.updateBrand(parseInt(brandId), updateBrandDto, req.user.userId);
  }

  // === USUARIOS ===
  @Get(':brandId/users')
  @ApiOperation({
    summary: 'Obtener usuarios del brand',
    description: 'Lista todos los usuarios asociados al brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Elementos por página' })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    example: 'all', 
    description: 'Filtrar por rol (all, client, staff, admin, employee)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: BaseResponseDto
  })
  async getBrandUsers(
    @Param('brandId') brandId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role: string = 'all',
    @Request() req: any
  ): Promise<BaseResponseDto<BrandUserResponseDto[]>> {
    return this.brandService.getBrandUsers(
      parseInt(brandId),
      parseInt(page),
      parseInt(limit),
      role,
      req.user.userId
    );
  }

  @Post(':brandId/users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo usuario en el brand',
    description: 'Agrega un nuevo usuario al brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: CreateBrandUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: BaseResponseDto
  })
  async createBrandUser(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) createUserDto: CreateBrandUserDto,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandUserResponseDto>> {
    return this.brandService.createBrandUser(parseInt(brandId), createUserDto, req.user.userId);
  }

  @Put(':brandId/users/:userId')
  @ApiOperation({
    summary: 'Actualizar usuario del brand',
    description: 'Actualiza la información de un usuario específico'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'userId', description: 'ID del usuario', example: 123 })
  @ApiBody({ type: UpdateBrandUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: BaseResponseDto
  })
  async updateBrandUser(
    @Param('brandId') brandId: string,
    @Param('userId') userId: string,
    @Body(ValidationPipe) updateUserDto: UpdateBrandUserDto,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandUserResponseDto>> {
    return this.brandService.updateBrandUser(
      parseInt(brandId),
      parseInt(userId),
      updateUserDto,
      req.user.userId
    );
  }

  @Delete(':brandId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar usuario del brand',
    description: 'Desactiva un usuario del brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiParam({ name: 'userId', description: 'ID del usuario', example: 123 })
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado exitosamente'
  })
  async deleteBrandUser(
    @Param('brandId') brandId: string,
    @Param('userId') userId: string,
    @Request() req: any
  ): Promise<void> {
    await this.brandService.deleteBrandUser(
      parseInt(brandId),
      parseInt(userId),
      req.user.userId
    );
  }

  // === FEATURES ===
  @Put(':brandId/features')
  @ApiOperation({
    summary: 'Actualizar features del brand',
    description: 'Activa o desactiva features del brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featureIds: {
          type: 'array',
          items: { type: 'number' },
          example: [236, 237, 238],
          description: 'Array de IDs de features a activar'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Features actualizadas exitosamente',
    type: BaseResponseDto
  })
  async updateBrandFeatures(
    @Param('brandId') brandId: string,
    @Body('featureIds') featureIds: number[],
    @Request() req: any
  ): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    return this.brandService.updateBrandFeatures(parseInt(brandId), featureIds, req.user.userId);
  }

  // === PLAN ===
  @Get(':brandId/plan')
  @ApiOperation({
    summary: 'Obtener información detallada del plan',
    description: 'Retorna información completa del plan actual, historial y opciones de upgrade'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiResponse({
    status: 200,
    description: 'Información del plan obtenida exitosamente',
    type: BaseResponseDto
  })
  async getBrandPlan(
    @Param('brandId') brandId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandPlanResponseDto>> {
    return this.brandService.getBrandPlanDetails(parseInt(brandId), req.user.userId);
  }

  @Put(':brandId/plan')
  @ApiOperation({
    summary: 'Actualizar plan del brand',
    description: 'Cambia el plan del brand y procesa el pago correspondiente'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiBody({ type: UpdateBrandPlanDto })
  @ApiResponse({
    status: 200,
    description: 'Plan actualizado exitosamente',
    type: BaseResponseDto
  })
  async updateBrandPlan(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) updatePlanDto: UpdateBrandPlanDto,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandPlanResponseDto>> {
    return this.brandService.updateBrandPlan(parseInt(brandId), updatePlanDto, req.user.userId);
  }

  // === ESTADÍSTICAS ===
  @Get(':brandId/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas del brand',
    description: 'Retorna estadísticas de uso, facturación y actividad'
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
    description: 'Estadísticas obtenidas exitosamente',
    type: BaseResponseDto
  })
  async getBrandStats(
    @Param('brandId') brandId: string,
    @Query('period') period: string = '30d',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.brandService.getBrandStats(parseInt(brandId), period, req.user.userId);
  }

  // === PAGOS ===
  @Get(':brandId/payments')
  @ApiOperation({
    summary: 'Obtener historial de pagos',
    description: 'Lista todos los pagos realizados por el brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Elementos por página' })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    example: 'all',
    description: 'Filtrar por estado (all, pending, completed, failed, cancelled)'
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de pagos obtenido exitosamente',
    type: BaseResponseDto
  })
  async getBrandPayments(
    @Param('brandId') brandId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status: string = 'all',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.brandService.getBrandPayments(
      parseInt(brandId),
      parseInt(page),
      parseInt(limit),
      status,
      req.user.userId
    );
  }

  // === ACTIVIDAD ===
  @Get(':brandId/activity')
  @ApiOperation({
    summary: 'Obtener log de actividad',
    description: 'Lista las actividades recientes del brand'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Elementos por página' })
  @ApiResponse({
    status: 200,
    description: 'Log de actividad obtenido exitosamente',
    type: BaseResponseDto
  })
  async getBrandActivity(
    @Param('brandId') brandId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req: any
  ): Promise<BaseResponseDto<any>> {
    return this.brandService.getBrandActivity(
      parseInt(brandId),
      parseInt(page),
      parseInt(limit),
      req.user.userId
    );
  }
}
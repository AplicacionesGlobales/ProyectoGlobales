// src/brand-features/brand-features.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
  ApiBody
} from '@nestjs/swagger';
import { BrandFeaturesService } from './brand-features.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';
import { Public } from '../common/decorators';
import {
  FeatureDto,
  BrandFeatureDto,
  AssignFeatureDto,
  UnassignFeatureDto
} from './dto/brand-feature.dto';

@ApiTags('Brand Features Management')
@Controller()
export class BrandFeaturesController {
  constructor(private readonly brandFeaturesService: BrandFeaturesService) {}

  // 1. Ver todos los features disponibles - PÚBLICO
  @Get('features')
  @Public()
  @ApiOperation({
    summary: 'Obtener todos los features disponibles',
    description: 'Retorna la lista completa de features/servicios disponibles en la plataforma. Acceso público.'
  })
  @ApiResponse({
    status: 200,
    description: 'Features obtenidos exitosamente',
    type: BaseResponseDto
  })
  async getAllFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    return this.brandFeaturesService.getAllFeatures();
  }

  // 2. Ver features asignados a un brand específico - PÚBLICO
  @Get('brand/:brandId/features')
  @Public()
  @ApiOperation({
    summary: 'Obtener features asignados a un brand',
    description: 'Retorna los features/servicios que tiene asignados un brand específico. Acceso público.'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Features del brand obtenidos exitosamente',
    type: BaseResponseDto
  })
  async getBrandFeatures(
    @Param('brandId') brandId: string
  ): Promise<BaseResponseDto<BrandFeatureDto[]>> {
    return this.brandFeaturesService.getBrandFeatures(parseInt(brandId));
  }

  // 3. Asignar feature a brand - SOLO DUEÑO
  @Post('brand/:brandId/features')
  @UseGuards(JwtAuthGuard, BrandOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Asignar feature a brand',
    description: 'Asigna un feature/servicio específico al brand. Solo el dueño del brand puede realizar esta acción.'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 1 })
  @ApiBody({ type: AssignFeatureDto })
  @ApiResponse({
    status: 201,
    description: 'Feature asignado exitosamente al brand',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Feature ya asignado o datos inválidos'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para modificar este brand'
  })
  @ApiResponse({
    status: 404,
    description: 'Brand o feature no encontrado'
  })
  async assignFeatureToBrand(
    @Param('brandId') brandId: string,
    @Body(ValidationPipe) assignData: AssignFeatureDto,
    @Request() req: any
  ): Promise<BaseResponseDto<BrandFeatureDto>> {
    return this.brandFeaturesService.assignFeatureToBrand(
      parseInt(brandId),
      assignData.featureId,
      req.user.userId
    );
  }

  // 4. Desasignar feature de brand - SOLO DUEÑO
  @Delete('brand/:brandId/features/:featureId')
  @UseGuards(JwtAuthGuard, BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desasignar feature de brand',
    description: 'Desasigna/desvincula un feature/servicio del brand. Solo el dueño del brand puede realizar esta acción.'
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 1 })
  @ApiParam({ name: 'featureId', description: 'ID del feature a desasignar', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Feature desasignado exitosamente del brand',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para modificar este brand'
  })
  @ApiResponse({
    status: 404,
    description: 'Brand, feature o asignación no encontrada'
  })
  async unassignFeatureFromBrand(
    @Param('brandId') brandId: string,
    @Param('featureId') featureId: string,
    @Request() req: any
  ): Promise<BaseResponseDto<{ message: string }>> {
    return this.brandFeaturesService.unassignFeatureFromBrand(
      parseInt(brandId),
      parseInt(featureId),
      req.user.userId
    );
  }
}
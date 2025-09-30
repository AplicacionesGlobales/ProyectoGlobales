// src/subscription/subscription.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionFeaturesResponseDto } from './dto/subscription-features.dto';
import {
  ActivateFeatureRequestDto,
  ActivateFeatureResponseDto
} from './dto/activate-feature.dto';

@ApiTags('Subscription Management')
@Controller('api/subscription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Get('features')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener funcionalidades activas de mi suscripción',
    description: 'Retorna las funcionalidades/servicios actualmente activos en la suscripción del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionalidades obtenidas exitosamente',
    type: SubscriptionFeaturesResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró suscripción activa'
  })
  async getMySubscriptionFeatures(
    @Request() req: any
  ): Promise<BaseResponseDto<SubscriptionFeaturesResponseDto>> {
    return this.subscriptionService.getUserSubscriptionFeatures(req.user.userId);
  }

  @Post('features/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar funcionalidad con validación de pago',
    description: 'Procesa la activación de una nueva funcionalidad para la marca del usuario autenticado, validando el pago correspondiente'
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionalidad activada exitosamente',
    type: ActivateFeatureResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error en el pago'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionalidad no encontrada o marca no activa'
  })
  @ApiResponse({
    status: 409,
    description: 'La funcionalidad ya está activa'
  })
  async activateFeature(
    @Request() req: any,
    @Body(ValidationPipe) activateFeatureDto: ActivateFeatureRequestDto
  ): Promise<BaseResponseDto<ActivateFeatureResponseDto>> {
    return this.subscriptionService.activateFeature(req.user.userId, activateFeatureDto);
  }
}
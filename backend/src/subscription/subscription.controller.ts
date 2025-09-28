// src/subscription/subscription.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
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

@ApiTags('Subscription Management')
@Controller('api/subscription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

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
}
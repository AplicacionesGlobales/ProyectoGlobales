// src/subscription/dto/activate-feature.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';

enum BillingPeriod {
  monthly = 'monthly',
  annual = 'annual',
}

export class ActivateFeatureRequestDto {
  @ApiProperty({
    description: 'ID de la funcionalidad a activar',
    example: 5,
  })
  @IsNumber()
  featureId: number;

  @ApiProperty({
    description:
      'Método de pago (opcional, se usa el por defecto si no se especifica)',
    example: 'card',
    required: false,
  })
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Período de facturación para la funcionalidad',
    enum: BillingPeriod,
    example: 'monthly',
    required: false,
  })
  @IsOptional()
  @IsEnum(BillingPeriod)
  billingPeriod?: BillingPeriod;
}

export class ActivateFeaturePaymentDto {
  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: 'TPAY_123456789' })
  tilopayReference: string;

  @ApiProperty({ example: 15.0 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  processedAt: string;
}

export class ActivateFeatureResponseDto {
  @ApiProperty({
    description: 'Funcionalidad que fue activada',
    example: {
      id: 5,
      key: 'advanced_reports',
      title: 'Reportes Avanzados',
      description: 'Sistema completo de reportes y analíticas',
      category: 'BUSINESS',
      price: 15.0,
      activatedAt: '2024-01-15T10:30:00.000Z',
    },
  })
  featureActivated: {
    id: number;
    key: string;
    title: string;
    description: string;
    category: string;
    price: number;
    activatedAt: string;
  };

  @ApiProperty({
    description: 'Estado actualizado de la suscripción',
    example: {
      totalMonthlyPrice: 44.0,
      subtotalFeatures: 15.0,
      basePlanPrice: 29.0,
      totalFeatures: 3,
    },
  })
  updatedSubscription: {
    totalMonthlyPrice: number;
    subtotalFeatures: number;
    basePlanPrice: number;
    totalFeatures: number;
  };

  @ApiProperty({
    description: 'Información del pago procesado',
    type: ActivateFeaturePaymentDto,
  })
  payment: ActivateFeaturePaymentDto;

  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Funcionalidad activada exitosamente',
  })
  message: string;
}

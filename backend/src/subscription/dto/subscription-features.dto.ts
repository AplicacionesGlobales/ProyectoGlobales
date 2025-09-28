// src/subscription/dto/subscription-features.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ActiveFeatureDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'appointment_booking' })
  key: string;

  @ApiProperty({ example: 'Sistema de Reservas' })
  title: string;

  @ApiProperty({ example: 'Permite a tus clientes agendar citas online' })
  description: string;

  @ApiProperty({ example: 'booking' })
  category: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  activatedAt: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  expiresAt?: string;
}

export class SubscriptionPlanDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Plan Profesional' })
  name: string;

  @ApiProperty({ example: 'professional' })
  type: string;

  @ApiProperty({ example: 'monthly' })
  billingPeriod: string;

  @ApiProperty({ example: '2024-02-01T00:00:00Z' })
  nextBillingDate: string;

  @ApiProperty({ example: 29.00 })
  basePrice: number;
}

export class SubscriptionLimitsDto {
  @ApiProperty({ example: 10, required: false })
  maxUsers?: number;

  @ApiProperty({ example: 1000, required: false })
  maxAppointments?: number;

  @ApiProperty({ example: 3, required: false })
  maxBranches?: number;

  @ApiProperty({ example: 50, required: false })
  storageGB?: number;
}

export class PricingBreakdownDto {
  @ApiProperty({ example: 'Sistema de Citas' })
  featureName: string;

  @ApiProperty({ example: 'citas' })
  featureKey: string;

  @ApiProperty({ example: 20.00 })
  price: number;

  @ApiProperty({ example: 'monthly' })
  billingPeriod: string;
}

export class CostBreakdownDto {
  @ApiProperty({ example: 29.00 })
  planBase: number;

  @ApiProperty({ example: 53.00 })
  features: number;

  @ApiProperty({ example: 0 })
  discounts: number;

  @ApiProperty({ example: 0 })
  taxes: number;

  @ApiProperty({ example: 82.00 })
  total: number;
}

export class CostSummaryDto {
  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ type: CostBreakdownDto })
  breakdown: CostBreakdownDto;

  @ApiProperty({ example: 82.00 })
  nextBillingAmount: number;

  @ApiProperty({ example: '2024-02-01T00:00:00Z' })
  nextBillingDate: string;
}

export class SubscriptionFeaturesResponseDto {
  @ApiProperty({ example: 1 })
  brandId: number;

  @ApiProperty({ example: 'Mi Negocio' })
  brandName: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'suspended'] })
  subscriptionStatus: string;

  @ApiProperty({ type: SubscriptionPlanDto, required: false })
  plan?: SubscriptionPlanDto;

  @ApiProperty({ type: [ActiveFeatureDto] })
  activeFeatures: ActiveFeatureDto[];

  @ApiProperty({ 
    example: { 
      ESSENTIAL: [{ id: 1, key: 'citas', title: 'Sistema de Citas' }],
      ADVANCED: [{ id: 2, key: 'analytics', title: 'Análisis Avanzado' }]
    } 
  })
  featuresByCategory: Record<string, ActiveFeatureDto[]>;

  @ApiProperty({ example: 3 })
  totalFeatures: number;

  @ApiProperty({ 
    type: [PricingBreakdownDto],
    description: 'Desglose detallado de costos por feature ordenado de mayor a menor precio'
  })
  pricingBreakdown: PricingBreakdownDto[];

  @ApiProperty({ example: 53.00, description: 'Suma de todas las features activas' })
  subtotalFeatures: number;

  @ApiProperty({ example: 29.00, description: 'Precio base del plan sin features' })
  basePlanPrice: number;

  @ApiProperty({ example: 82.00, description: 'Precio total mensual (plan + features)' })
  totalMonthlyPrice: number;

  @ApiProperty({ type: CostSummaryDto, description: 'Resumen completo de costos' })
  costSummary: CostSummaryDto;

  @ApiProperty({ example: 149.95, deprecated: true, description: 'Use subtotalFeatures instead' })
  monthlyFeaturesPrice: number;

  @ApiProperty({ type: SubscriptionLimitsDto })
  limits: SubscriptionLimitsDto;
}
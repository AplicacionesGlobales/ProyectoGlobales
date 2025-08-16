import { IsNumber, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual'
}

export class UpdateBrandPlanDto {
  @ApiProperty({ example: 102, description: 'ID del nuevo plan' })
  @IsNumber()
  planId: number;

  @ApiPropertyOptional({ enum: BillingPeriod, example: BillingPeriod.ANNUAL })
  @IsEnum(BillingPeriod)
  @IsOptional()
  billingPeriod?: BillingPeriod;

  @ApiPropertyOptional({ 
    example: [236, 237, 240], 
    description: 'IDs de features adicionales' 
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  additionalFeatureIds?: number[];
}

export class BrandPlanHistoryDto {
  @ApiProperty({ example: 456 })
  id: number;

  @ApiProperty({ example: 103 })
  planId: number;

  @ApiProperty({ example: 'complete' })
  planType: string;

  @ApiProperty({ example: 'Plan Completo' })
  planName: string;

  @ApiProperty({ example: 167.50 })
  price: number;

  @ApiProperty({ example: 'monthly' })
  billingPeriod: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  startDate: string;

  @ApiPropertyOptional({ example: '2024-12-15T10:30:00Z' })
  endDate?: string;

  @ApiProperty({ example: false })
  isActive: boolean;

  @ApiProperty({ example: 'upgrade' })
  changeReason: string;
}

export class PlanComparisonDto {
  @ApiProperty({ example: 102 })
  planId: number;

  @ApiProperty({ example: 'app' })
  type: string;

  @ApiProperty({ example: 'Plan App Móvil' })
  name: string;

  @ApiProperty({ example: 'Solo aplicación móvil nativa' })
  description: string;

  @ApiProperty({ example: 59 })
  basePrice: number;

  @ApiProperty({ example: 142.50 })
  totalPriceWithFeatures: number;

  @ApiProperty({ example: ['App nativa', 'Notificaciones push', 'Soporte prioritario'] })
  includedFeatures: string[];

  @ApiProperty({ example: true })
  isRecommended: boolean;

  @ApiProperty({ example: false })
  isCurrentPlan: boolean;
}

export class BrandPlanResponseDto {
  @ApiProperty({ example: 456 })
  id: number;

  @ApiProperty({ example: 103 })
  planId: number;

  @ApiProperty({ example: 'complete' })
  planType: string;

  @ApiProperty({ example: 'Plan Completo' })
  planName: string;

  @ApiProperty({ example: 'Web + App móvil nativa' })
  planDescription: string;

  @ApiProperty({ example: 99 })
  basePrice: number;

  @ApiProperty({ example: 167.50 })
  currentPrice: number;

  @ApiProperty({ example: 'monthly' })
  billingPeriod: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  startDate: string;

  @ApiPropertyOptional({ example: '2025-01-15T10:30:00Z' })
  endDate?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2024-02-15T10:30:00Z' })
  nextBillingDate?: string;

  @ApiProperty({ example: 30 })
  daysUntilNextBilling: number;

  @ApiProperty({ type: [BrandPlanHistoryDto] })
  history: BrandPlanHistoryDto[];

  @ApiProperty({ type: [PlanComparisonDto] })
  availableUpgrades: PlanComparisonDto[];
}
// src/sprint10/dto/billing-calculation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsDecimal,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class ProrationCalculationDto {
  @ApiProperty({
    description: 'Fecha de inicio del período',
    example: '2025-10-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del período',
    example: '2025-10-31T23:59:59.999Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Días utilizados en el período',
    example: 15,
  })
  @IsNumber()
  daysUsed: number;

  @ApiProperty({
    description: 'Total de días en el período',
    example: 31,
  })
  @IsNumber()
  totalDays: number;

  @ApiProperty({
    description: 'Monto original del plan',
    example: '100.00',
  })
  @IsDecimal()
  originalAmount: string;

  @ApiProperty({
    description: 'Monto prorrateado',
    example: '48.39',
  })
  @IsDecimal()
  proratedAmount: string;
}

export class BillingCalculationRequestDto {
  @ApiProperty({
    description: 'ID del brand',
    example: 1,
  })
  @IsNumber()
  brandId: number;

  @ApiProperty({
    description: 'ID del plan',
    example: 1,
  })
  @IsNumber()
  planId: number;

  @ApiProperty({
    description: 'Fecha de inicio del servicio',
    example: '2025-10-15T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del servicio (opcional)',
    example: '2025-11-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class BillingCalculationResponseDto {
  @ApiProperty({
    description: 'ID del brand',
    example: 1,
  })
  @IsNumber()
  brandId: number;

  @ApiProperty({
    description: 'Información del plan',
  })
  plan: {
    id: number;
    name: string;
    price: string;
    billingPeriod: string;
  };

  @ApiProperty({
    description: 'Cálculo de prorrateo',
  })
  prorationCalculation: ProrationCalculationDto;

  @ApiProperty({
    description: 'Próxima fecha de renovación',
    example: '2025-11-15T00:00:00.000Z',
  })
  @IsDateString()
  nextRenewalDate: string;
}

export class ManualRenewalRequestDto {
  @ApiProperty({
    description: 'ID del brand',
    example: 1,
  })
  @IsNumber()
  brandId: number;

  @ApiProperty({
    description: 'ID del plan actual',
    example: 1,
  })
  @IsNumber()
  currentPlanId: number;

  @ApiProperty({
    description: 'ID del nuevo plan (opcional, si es diferente)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  newPlanId?: number;
}

export class ManualRenewalResponseDto {
  @ApiProperty({
    description: 'ID del nuevo brand plan creado',
    example: 5,
  })
  @IsNumber()
  newBrandPlanId: number;

  @ApiProperty({
    description: 'Fecha de renovación',
    example: '2025-11-15T00:00:00.000Z',
  })
  @IsDateString()
  renewalDate: string;

  @ApiProperty({
    description: 'Monto a cobrar',
    example: '100.00',
  })
  @IsDecimal()
  amount: string;

  @ApiProperty({
    description: 'Información del plan renovado',
  })
  plan: {
    id: number;
    name: string;
    price: string;
    billingPeriod: string;
  };

  @ApiProperty({
    description: 'Próxima fecha de vencimiento',
    example: '2025-12-15T00:00:00.000Z',
  })
  @IsDateString()
  nextExpirationDate: string;
}

// src/brand-features/dto/brand-feature.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export enum FeatureCategory {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ADVANCED = 'ADVANCED'
}

export class FeatureDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'appointment_booking' })
  key: string;

  @ApiProperty({ example: 'Sistema de reservas en línea' })
  title: string;

  @ApiPropertyOptional({ example: 'Permite a tus clientes reservar citas online' })
  subtitle?: string;

  @ApiProperty({ example: 'Sistema completo de gestión de citas y reservas para tu negocio' })
  description: string;

  @ApiProperty({ example: 15000, description: 'Precio en colones costarricenses' })
  price: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: ['salon', 'clinic', 'restaurant'] })
  businessTypes: string[];

  @ApiProperty({ enum: FeatureCategory, example: FeatureCategory.PREMIUM })
  category: FeatureCategory;

  @ApiProperty({ example: true })
  isPopular: boolean;

  @ApiProperty({ example: false })
  isRecommended: boolean;

  @ApiProperty({ example: 1, description: 'Orden de visualización' })
  order: number;

  @ApiProperty({ example: '2024-08-18T15:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-08-18T15:30:00Z' })
  updatedAt: string;
}

export class BrandFeatureDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  brandId: number;

  @ApiProperty({ example: 1 })
  featureId: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-08-18T15:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-08-18T15:30:00Z' })
  updatedAt: string;

  @ApiProperty({ type: FeatureDto })
  feature: FeatureDto;
}

export class AssignFeatureDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID del feature a asignar al brand'
  })
  @IsNumber()
  @IsNotEmpty()
  featureId: number;
}

export class UnassignFeatureDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID del feature a desasignar del brand'
  })
  @IsNumber()
  @IsNotEmpty()
  featureId: number;
}
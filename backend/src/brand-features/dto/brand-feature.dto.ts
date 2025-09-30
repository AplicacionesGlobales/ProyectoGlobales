// src/brand-features/dto/brand-feature.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString, IsArray, IsEnum, IsBoolean, Min } from 'class-validator';

export enum FeatureCategory {
  ESSENTIAL = 'ESSENTIAL',
  BUSINESS = 'BUSINESS',
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

  @ApiProperty({ enum: FeatureCategory, example: FeatureCategory.BUSINESS })
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

export class CreateFeatureDto {
  @ApiProperty({
    example: 'online_booking_pro',
    description: 'Clave única identificadora de la funcionalidad'
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 'Reservas Online Pro',
    description: 'Título de la funcionalidad'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Sistema avanzado de reservas',
    description: 'Subtítulo opcional de la funcionalidad'
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    example: 'Sistema completo de reservas online con funciones avanzadas de gestión y automatización',
    description: 'Descripción detallada de la funcionalidad'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 25.00,
    description: 'Precio mensual de la funcionalidad en USD'
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    enum: FeatureCategory,
    example: FeatureCategory.BUSINESS,
    description: 'Categoría de la funcionalidad'
  })
  @IsEnum(FeatureCategory)
  category: FeatureCategory;

  @ApiProperty({
    example: ['barbershop', 'salon', 'spa'],
    description: 'Tipos de negocio compatibles con esta funcionalidad'
  })
  @IsArray()
  @IsString({ each: true })
  businessTypes: string[];

  @ApiPropertyOptional({
    example: false,
    description: 'Si la funcionalidad es recomendada',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si la funcionalidad es popular',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Orden de visualización (menor número = mayor prioridad)',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
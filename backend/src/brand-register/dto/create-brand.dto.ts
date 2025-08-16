import { IsString, IsEmail, IsOptional, IsEnum, IsArray, ValidateNested, IsObject, IsNumber, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PlanType {
  WEB = 'web',
  APP = 'app', 
  COMPLETE = 'complete',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export class ColorPaletteDto {
  @ApiProperty({ example: '#1a73e8' })
  @IsString()
  primary: string;

  @ApiProperty({ example: '#34a853' })
  @IsString()
  secondary: string;

  @ApiProperty({ example: '#fbbc04' })
  @IsString()
  accent: string;

  @ApiProperty({ example: '#9aa0a6' })
  @IsString()
  neutral: string;

  @ApiProperty({ example: '#137333' })
  @IsString()
  success: string;
}

export class CreateBrandDto {
  // Información de autenticación del usuario
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'usuario_abc123' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'ContraseñaSegura123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  // Información de la marca
  @ApiProperty({ example: 'Mi Empresa' })
  @IsString()
  brandName: string;

  @ApiPropertyOptional({ example: 'Descripción del servicio' })
  @IsString()
  @IsOptional()
  brandDescription?: string;

  @ApiPropertyOptional({ example: '+506 8888-8888' })
  @IsString()
  @IsOptional()
  brandPhone?: string;

  // Detalles del negocio - AHORA CON IDs NUMÉRICOS
  @ApiProperty({ example: 23, description: 'ID numérico del tipo de negocio' })
  @IsNumber()
  businessTypeId: number;

  @ApiProperty({ example: [236, 237, 238], description: 'Array de IDs numéricos de features' })
  @IsArray()
  @IsNumber({}, { each: true })
  selectedFeatureIds: number[];

  // Personalización
  @ApiProperty({ type: ColorPaletteDto })
  @ValidateNested()
  @Type(() => ColorPaletteDto)
  @IsObject()
  colorPalette: ColorPaletteDto;

  // Plan seleccionado - AHORA CON ID NUMÉRICO
  @ApiProperty({ example: 103, description: 'ID numérico del plan' })
  @IsNumber()
  planId: number;

  @ApiPropertyOptional({ enum: BillingPeriod, example: BillingPeriod.MONTHLY })
  @IsEnum(BillingPeriod)
  @IsOptional()
  planBillingPeriod?: BillingPeriod;

  @ApiProperty({ example: 167, description: 'Precio total calculado' })
  @IsNumber()
  totalPrice: number;

  // Imágenes como base64 strings
  @ApiPropertyOptional({ example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' })
  @IsString()
  @IsOptional()
  logoImage?: string;

  @ApiPropertyOptional({ example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' })
  @IsString()
  @IsOptional()
  isotopoImage?: string;

  @ApiPropertyOptional({ example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' })
  @IsString()
  @IsOptional()
  imagotipoImage?: string;

  // Metadatos
  @ApiPropertyOptional({ example: '2025-08-10T21:30:00.000Z' })
  @IsString()
  @IsOptional()
  registrationDate?: string;

  @ApiPropertyOptional({ example: 'landing_onboarding' })
  @IsString()
  @IsOptional()
  source?: string;
}
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

export class PlanDto {
  @ApiProperty({ enum: PlanType, example: PlanType.WEB })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty({ example: 0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: ['Citas ilimitadas', 'Soporte básico'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ enum: BillingPeriod, example: BillingPeriod.MONTHLY })
  @IsEnum(BillingPeriod)
  @IsOptional()
  billingPeriod?: BillingPeriod;
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

  // Detalles del negocio
  @ApiPropertyOptional({ example: 'fotografo' })
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiPropertyOptional({ example: ['citas', 'ubicaciones', 'archivos', 'pagos'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedFeatures?: string[];

  // Personalización
  @ApiProperty({ type: ColorPaletteDto })
  @ValidateNested()
  @Type(() => ColorPaletteDto)
  @IsObject()
  colorPalette: ColorPaletteDto;

  // Plan seleccionado
  @ApiProperty({ type: PlanDto })
  @ValidateNested()
  @Type(() => PlanDto)
  @IsObject()
  plan: PlanDto;

  // Metadatos
  @ApiPropertyOptional({ example: '2025-08-10T21:30:00.000Z' })
  @IsString()
  @IsOptional()
  registrationDate?: string;

  @ApiPropertyOptional({ example: 'landing_onboarding' })
  @IsString()
  @IsOptional()
  source?: string;

  // Para manejar archivos (estos campos se agregarán en el controller con FormData)
  logoFile?: any;
  isotopoFile?: any;
  imagotipoFile?: any;
}

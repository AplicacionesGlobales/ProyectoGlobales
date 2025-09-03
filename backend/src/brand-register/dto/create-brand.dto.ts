// src/brand-register/dto/create-brand.dto.ts

import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  ValidateNested, 
  IsObject, 
  IsNumber, 
  IsBoolean,
  IsHexColor,
  Min,
  Max,
  MinLength,
  MaxLength
} from 'class-validator';
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

export class ServiceTypeInitialDto {
  @ApiProperty({ 
    example: 'Corte de Cabello',
    description: 'Nombre del tipo de servicio' 
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ 
    example: 'Corte clásico para caballeros',
    description: 'Descripción del servicio' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ 
    example: 30,
    description: 'Duración en minutos (debe ser múltiplo de 15)' 
  })
  @IsNumber()
  @Min(15)
  @Max(480) // Máximo 8 horas
  duration: number;

  @ApiPropertyOptional({ 
    example: 15000,
    description: 'Precio del servicio' 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ 
    example: '#3B82F6',
    description: 'Color hexadecimal para visualización' 
  })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ 
    example: 'scissors',
    description: 'Nombre del ícono para UI' 
  })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class AppointmentSettingsInitialDto {
  @ApiProperty({ 
    example: true,
    description: 'Activar tipos de servicio personalizados' 
  })
  @IsBoolean()
  useServiceTypes: boolean;

  @ApiPropertyOptional({ 
    example: 30,
    description: 'Duración por defecto para citas sin tipo específico' 
  })
  @IsNumber()
  @IsOptional()
  @Min(15)
  @Max(480)
  defaultDuration?: number;

  @ApiPropertyOptional({ 
    type: [ServiceTypeInitialDto],
    description: 'Lista de tipos de servicio iniciales',
    example: [
      {
        name: 'Corte de Cabello',
        description: 'Corte clásico',
        duration: 30,
        price: 15000,
        color: '#3B82F6',
        icon: 'scissors'
      },
      {
        name: 'Barba',
        description: 'Arreglo de barba',
        duration: 15,
        price: 8000,
        color: '#10B981',
        icon: 'razor'
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTypeInitialDto)
  @IsOptional()
  serviceTypes?: ServiceTypeInitialDto[];
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

  @ApiPropertyOptional({ example: 'Av. Principal 123, San José' })
  @IsString()
  @IsOptional()
  brandAddress?: string;

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

  // Configuración de citas y tipos de servicio
  @ApiPropertyOptional({ 
    type: AppointmentSettingsInitialDto,
    description: 'Configuración inicial de citas y tipos de servicio',
    example: {
      useServiceTypes: true,
      defaultDuration: 30,
      serviceTypes: [
        {
          name: 'Corte de Cabello',
          description: 'Corte clásico para caballeros',
          duration: 30,
          price: 15000,
          color: '#3B82F6',
          icon: 'scissors'
        },
        {
          name: 'Barba',
          description: 'Arreglo y diseño de barba',
          duration: 15,
          price: 8000,
          color: '#10B981',
          icon: 'razor'
        }
      ]
    }
  })
  @ValidateNested()
  @Type(() => AppointmentSettingsInitialDto)
  @IsOptional()
  appointmentSettings?: AppointmentSettingsInitialDto;

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
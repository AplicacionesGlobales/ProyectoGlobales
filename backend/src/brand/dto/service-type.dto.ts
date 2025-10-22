// src/brand/dto/service-type.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentSettingsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: true,
    description: 'Si usa tipos de servicio personalizados',
  })
  useServiceTypes: boolean;

  @ApiProperty({ example: 30, description: 'Duración por defecto en minutos' })
  defaultDuration: number;

  @ApiProperty({
    example: 5,
    description: 'Tiempo de buffer entre citas en minutos',
  })
  bufferTime: number;

  @ApiProperty({
    example: 30,
    description: 'Días máximos de anticipación para reservar',
  })
  maxAdvanceBookingDays: number;

  @ApiProperty({
    example: 2,
    description: 'Horas mínimas de anticipación para reservar',
  })
  minAdvanceBookingHours: number;

  @ApiProperty({ example: true, description: 'Permite reservas el mismo día' })
  allowSameDayBooking: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

export class ServiceTypeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID único del tipo de servicio',
  })
  id: number;

  @ApiProperty({
    example: 456,
    description: 'ID del brand al que pertenece',
  })
  brandId: number;

  @ApiProperty({
    example: 'Corte de Cabello',
    description: 'Nombre del tipo de servicio',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Corte clásico para caballeros con acabado profesional',
    description: 'Descripción detallada del servicio',
  })
  description?: string;

  @ApiProperty({
    example: 30,
    description: 'Duración en minutos (múltiplo de 15)',
  })
  duration: number;

  @ApiPropertyOptional({
    example: 15000,
    description: 'Precio del servicio en la moneda local',
  })
  price?: number;

  @ApiPropertyOptional({
    example: '#3B82F6',
    description: 'Color hexadecimal para identificación visual',
  })
  color?: string;

  @ApiPropertyOptional({
    example: 'scissors',
    description: 'Nombre del ícono para UI (ej: scissors, razor, star)',
  })
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Estado activo/inactivo del servicio',
  })
  isActive: boolean;

  @ApiProperty({
    example: 0,
    description: 'Orden de visualización en listas',
  })
  order: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    example: 25,
    description: 'Número total de citas con este tipo de servicio',
  })
  appointmentCount?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si tiene citas futuras programadas',
  })
  hasFutureAppointments?: boolean;
}

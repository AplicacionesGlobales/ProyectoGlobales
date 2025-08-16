// src/schedule/dto/appointment-settings.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsBoolean } from 'class-validator';

export class AppointmentSettingsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 30, description: 'Duración por defecto en minutos' })
  defaultDuration: number;

  @ApiProperty({ example: 5, description: 'Tiempo de buffer entre citas en minutos' })
  bufferTime: number;

  @ApiProperty({ example: 30, description: 'Máximo días de anticipación' })
  maxAdvanceBookingDays: number;

  @ApiProperty({ example: 2, description: 'Mínimo horas de anticipación' })
  minAdvanceBookingHours: number;

  @ApiProperty({ example: true, description: 'Permitir reservas para el mismo día' })
  allowSameDayBooking: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

export class UpdateAppointmentSettingsDto {
  @ApiProperty({ example: 30, description: 'Duración por defecto en minutos' })
  @IsNumber()
  defaultDuration: number;

  @ApiProperty({ example: 5, description: 'Tiempo de buffer entre citas en minutos' })
  @IsNumber()
  bufferTime: number;

  @ApiProperty({ example: 30, description: 'Máximo días de anticipación' })
  @IsNumber()
  maxAdvanceBookingDays: number;

  @ApiProperty({ example: 2, description: 'Mínimo horas de anticipación' })
  @IsNumber()
  minAdvanceBookingHours: number;

  @ApiProperty({ example: true, description: 'Permitir reservas para el mismo día' })
  @IsBoolean()
  allowSameDayBooking: boolean;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ValidateCalendarDto {
  @ApiProperty({
    example: '2024-12-25',
    description: 'Fecha para validar disponibilidad (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    example: '14:30',
    description: 'Hora para validar disponibilidad (HH:MM)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe tener el formato HH:MM (24 horas)',
  })
  time: string;
}

export class CalendarValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Si el horario está disponible',
  })
  isAvailable: boolean;

  @ApiProperty({
    example: 'Horario disponible',
    description: 'Mensaje descriptivo del estado',
  })
  message: string;

  @ApiProperty({
    example: '2024-12-25',
    description: 'Fecha validada',
  })
  date: string;

  @ApiProperty({
    example: '14:30',
    description: 'Hora validada',
  })
  time: string;

  @ApiProperty({
    example: 'Negocio cerrado',
    description: 'Razón por la cual no está disponible (si aplica)',
    required: false,
  })
  reason?: string;
}

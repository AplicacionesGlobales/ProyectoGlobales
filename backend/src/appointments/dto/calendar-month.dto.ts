// src/appointments/dto/calendar-month.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { AppointmentStatus } from './appointment.dto';

export class GetCalendarMonthDto {
  @ApiProperty({
    example: '2024-08',
    description: 'Mes en formato YYYY-MM',
  })
  @IsString()
  @IsNotEmpty()
  month: string;
}

export class DayOccupancyDto {
  @ApiProperty({ example: '2024-08-20' })
  date: string;

  @ApiProperty({ example: 5 })
  totalAppointments: number;

  @ApiProperty({ example: 3 })
  confirmedAppointments: number;

  @ApiProperty({ example: 1 })
  pendingAppointments: number;

  @ApiProperty({ example: 1 })
  completedAppointments: number;

  @ApiProperty({ example: 0 })
  cancelledAppointments: number;

  @ApiProperty({ example: 180, description: 'Total de minutos ocupados' })
  totalOccupiedMinutes: number;

  @ApiProperty({
    example: 480,
    description: 'Total de minutos disponibles en el día',
  })
  totalAvailableMinutes: number;

  @ApiProperty({
    example: 37.5,
    description: 'Porcentaje de ocupación del día',
  })
  occupancyPercentage: number;

  @ApiProperty({
    example: true,
    description: 'Si el negocio está abierto este día',
  })
  isBusinessOpen: boolean;
}

export class MonthSummaryDto {
  @ApiProperty({ example: 45 })
  totalAppointments: number;

  @ApiProperty({ example: 30 })
  confirmedAppointments: number;

  @ApiProperty({ example: 10 })
  pendingAppointments: number;

  @ApiProperty({ example: 25 })
  completedAppointments: number;

  @ApiProperty({ example: 5 })
  cancelledAppointments: number;

  @ApiProperty({
    example: 1350,
    description: 'Total de minutos ocupados en el mes',
  })
  totalOccupiedMinutes: number;

  @ApiProperty({
    example: 10080,
    description: 'Total de minutos disponibles en el mes',
  })
  totalAvailableMinutes: number;

  @ApiProperty({
    example: 13.4,
    description: 'Porcentaje de ocupación promedio del mes',
  })
  averageOccupancyPercentage: number;

  @ApiProperty({ example: 22, description: 'Días laborables en el mes' })
  businessDaysInMonth: number;

  @ApiProperty({ example: 18, description: 'Días con al menos una cita' })
  daysWithAppointments: number;
}

export class CalendarMonthResponseDto {
  @ApiProperty({ example: '2024-08' })
  month: string;

  @ApiProperty({ type: MonthSummaryDto })
  summary: MonthSummaryDto;

  @ApiProperty({ type: [DayOccupancyDto] })
  days: DayOccupancyDto[];
}

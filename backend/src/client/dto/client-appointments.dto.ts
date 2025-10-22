// client/dto/client-appointments.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentStatus } from '../../../generated/prisma';

export class ClientAppointmentDto {
  @ApiProperty({ example: 1, description: 'ID de la cita' })
  id: number;

  @ApiProperty({
    example: '2025-08-25T10:00:00Z',
    description: 'Fecha y hora de inicio',
  })
  startTime: string;

  @ApiProperty({
    example: '2025-08-25T10:30:00Z',
    description: 'Fecha y hora de fin',
  })
  endTime: string;

  @ApiProperty({ example: 30, description: 'Duración en minutos' })
  duration: number;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.COMPLETED,
    description: 'Estado de la cita',
  })
  status: AppointmentStatus;

  @ApiPropertyOptional({
    example: 'Corte de cabello y barba',
    description: 'Notas de la cita',
  })
  notes?: string;

  @ApiProperty({
    example: '2025-08-20T14:30:00Z',
    description: 'Fecha de creación de la cita',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-08-24T16:45:00Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: string;
}

export class GetClientAppointmentsQueryDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Fecha de inicio para filtrar (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Fecha de fin para filtrar (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    description: 'Filtrar por estado de la cita',
    example: AppointmentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página (empezando en 1)',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Número de citas por página (máximo 50)',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['upcoming', 'past', 'today', 'all'],
    example: 'all',
    description:
      'Período de tiempo: upcoming (próximas), past (pasadas), today (hoy), all (todas)',
    default: 'all',
  })
  @IsOptional()
  @IsString()
  period?: 'upcoming' | 'past' | 'today' | 'all' = 'all';
}

export class ClientAppointmentListResponseDto {
  @ApiProperty({
    type: [ClientAppointmentDto],
    description: 'Lista de citas del cliente',
  })
  appointments: ClientAppointmentDto[];

  @ApiProperty({
    description: 'Información de paginación',
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({
    description: 'Estadísticas resumidas',
    example: {
      totalAppointments: 25,
      completedAppointments: 20,
      cancelledAppointments: 3,
      pendingAppointments: 2,
    },
  })
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
  };
}

import { IsEnum, IsOptional, IsString, MinLength, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from 'generated/prisma';

export class StatusTransitionDto {
  @ApiProperty({ 
    enum: AppointmentStatus,
    description: 'Nuevo estado de la cita' 
  })
  @IsEnum(AppointmentStatus)
  newStatus: AppointmentStatus;

  @ApiPropertyOptional({ 
    description: 'Razón del cambio de estado',
    example: 'Cliente solicitó cancelar por motivos personales'
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Nueva fecha/hora si es reprogramación',
    example: '2024-08-20T10:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  rescheduleDateTime?: string;

  @ApiPropertyOptional({ 
    description: 'Notas internas adicionales',
    example: 'Cliente prefiere horarios matutinos para futuras citas'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Notificar al cliente del cambio',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  notifyClient?: boolean;
}

export class StatusHistoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  appointmentId: number;

  @ApiProperty({ enum: AppointmentStatus })
  fromStatus: AppointmentStatus;

  @ApiProperty({ enum: AppointmentStatus })
  toStatus: AppointmentStatus;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  changedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;
}

export class TransitionValidationResultDto {
  @ApiProperty()
  isValid: boolean;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  requiredFields?: string[];

  @ApiProperty({ type: [String], enum: AppointmentStatus })
  allowedTransitions: AppointmentStatus[];

  @ApiPropertyOptional()
  warnings?: string[];
}

export class StatusStatisticsDto {
  @ApiProperty()
  statusDistribution: Record<AppointmentStatus, number>;

  @ApiProperty()
  cancellationRate: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  noShowRate: number;

  @ApiProperty()
  topCancellationReasons?: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;

  @ApiProperty()
  totalAppointments: number;

  @ApiProperty()
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
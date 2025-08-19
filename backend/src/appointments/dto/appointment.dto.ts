// src/appointments/dto/appointment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsNumber, 
  IsEnum, 
  Min, 
  Max,
  IsNotEmpty,
  MinLength
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export class AppointmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  brandId: number;

  @ApiPropertyOptional({ example: 2, description: 'ID del cliente (opcional para citas sin asignar)' })
  clientId?: number;

  @ApiProperty({ example: '2024-08-20T10:00:00Z' })
  startTime: string;

  @ApiProperty({ example: '2024-08-20T10:30:00Z' })
  endTime: string;

  @ApiProperty({ example: 30, description: 'Duración en minutos' })
  duration: number;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Consulta general' })
  notes?: string;

  @ApiProperty({ example: 1, description: 'Usuario que creó la cita' })
  createdBy: number;

  @ApiProperty({ example: '2024-08-18T15:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-08-18T15:30:00Z' })
  updatedAt: string;

  // Información adicional para respuestas
  @ApiPropertyOptional()
  client?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };

  @ApiPropertyOptional()
  creator?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export class CreateAppointmentDto {
  @ApiProperty({ 
    example: '2024-08-20T10:00:00Z', 
    description: 'Fecha y hora de inicio de la cita' 
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiPropertyOptional({ 
    example: 30, 
    description: 'Duración en minutos (opcional, usa configuración por defecto)' 
  })
  @IsNumber()
  @Min(15)
  @Max(480)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ 
    example: 'Consulta general',
    description: 'Notas de la cita'
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  notes?: string;
}

export class CreateAppointmentByRootDto extends CreateAppointmentDto {
  @ApiPropertyOptional({ 
    example: 2, 
    description: 'ID del cliente para asignar la cita (opcional)' 
  })
  @IsNumber()
  @IsOptional()
  clientId?: number;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: '2024-08-20T11:00:00Z' })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @Min(15)
  @Max(480)
  @IsOptional()
  duration?: number;

  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Cliente llegó tarde' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  clientId?: number;
}

export class GetAppointmentsQueryDto {
  @ApiPropertyOptional({ 
    example: '2024-08-20', 
    description: 'Fecha de inicio para filtrar (YYYY-MM-DD)' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2024-08-27', 
    description: 'Fecha de fin para filtrar (YYYY-MM-DD)' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    enum: AppointmentStatus, 
    description: 'Filtrar por estatus' 
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ 
    example: 2, 
    description: 'Filtrar por cliente' 
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  clientId?: number;

  @ApiPropertyOptional({ 
    example: 1, 
    description: 'Página' 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 20, 
    description: 'Elementos por página' 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}

export class AvailableTimeSlotsDto {
  @ApiProperty({ 
    example: '2024-08-20', 
    description: 'Fecha para consultar disponibilidad (YYYY-MM-DD)' 
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ 
    example: 30, 
    description: 'Duración deseada en minutos' 
  })
  @IsNumber()
  @Min(15)
  @Max(480)
  @IsOptional()
  duration?: number;
}

export class TimeSlotDto {
  @ApiProperty({ example: '09:00' })
  time: string;

  @ApiProperty({ example: true })
  available: boolean;

  @ApiPropertyOptional({ example: 'Horario ocupado' })
  reason?: string;
}
// src/appointments/dto/real-time-slots.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetRealTimeSlotsDto {
  @ApiProperty({
    description: 'Fecha para la cual se quieren obtener los slots disponibles',
    example: '2024-03-15',
    required: true,
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description:
      'ID del tipo de servicio (opcional, si no se especifica se usan todos)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceTypeId?: number;

  @ApiProperty({
    description:
      'Duración personalizada en minutos (opcional, si no se especifica se usa la del servicio)',
    example: 60,
    required: false,
    minimum: 15,
    maximum: 480,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(480)
  duration?: number;

  @ApiProperty({
    description: 'Hora de inicio para filtrar slots (formato HH:mm)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    description: 'Hora de fin para filtrar slots (formato HH:mm)',
    example: '17:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: 'Incluir solo slots que permitan el tipo de servicio completo',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyFullSlots?: boolean = true;

  @ApiProperty({
    description: 'Intervalo entre slots en minutos',
    example: 15,
    required: false,
    default: 15,
    minimum: 5,
    maximum: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(60)
  slotInterval?: number = 15;
}

export class ServiceTypeSlotDto {
  @ApiProperty({
    description: 'ID del tipo de servicio',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del tipo de servicio',
    example: 'Corte de cabello',
  })
  name: string;

  @ApiProperty({
    description: 'Duración en minutos',
    example: 45,
  })
  duration: number;

  @ApiProperty({
    description: 'Precio del servicio',
    example: 25000,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Color asociado al servicio',
    example: '#FF5733',
    required: false,
  })
  color?: string;

  @ApiProperty({
    description: 'Icono del servicio',
    example: 'scissors',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: 'Slots disponibles para este servicio',
    type: [Object],
    example: [
      {
        startTime: '09:00',
        endTime: '09:45',
        available: true,
        duration: 45,
        canFitService: true,
      },
    ],
  })
  availableSlots: RealTimeSlotDto[];
}

export class RealTimeSlotDto {
  @ApiProperty({
    description: 'Hora de inicio del slot',
    example: '09:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'Hora de fin del slot',
    example: '09:30',
  })
  endTime: string;

  @ApiProperty({
    description: 'Si el slot está disponible',
    example: true,
  })
  available: boolean;

  @ApiProperty({
    description: 'Duración del slot en minutos',
    example: 30,
  })
  duration: number;

  @ApiProperty({
    description:
      'Si el slot puede acomodar completamente el servicio solicitado',
    example: true,
  })
  canFitService: boolean;

  @ApiProperty({
    description: 'Razón por la cual el slot no está disponible',
    example: 'Cita existente',
    required: false,
  })
  unavailableReason?: string;

  @ApiProperty({
    description: 'ID de la cita que ocupa este slot (si aplica)',
    example: 123,
    required: false,
  })
  conflictingAppointmentId?: number;

  @ApiProperty({
    description: 'Información de la cita que ocupa este slot',
    required: false,
  })
  conflictingAppointment?: {
    id: number;
    startTime: string;
    endTime: string;
    duration: number;
    clientName?: string;
    serviceTypeName?: string;
    status: string;
  };
}

export class RealTimeSlotsResponseDto {
  @ApiProperty({
    description: 'Fecha consultada',
    example: '2024-03-15',
  })
  date: string;

  @ApiProperty({
    description: 'Si el negocio está abierto en esta fecha',
    example: true,
  })
  isBusinessOpen: boolean;

  @ApiProperty({
    description: 'Horario de operación del negocio',
    required: false,
  })
  businessHours?: {
    start: string;
    end: string;
  };

  @ApiProperty({
    description: 'Configuración utilizada para generar los slots',
  })
  configuration: {
    serviceTypeId?: number;
    requestedDuration?: number;
    slotInterval: number;
    onlyFullSlots: boolean;
    timeRange?: {
      start: string;
      end: string;
    };
  };

  @ApiProperty({
    description: 'Slots disponibles agrupados por tipo de servicio',
    type: [ServiceTypeSlotDto],
  })
  serviceTypeSlots: ServiceTypeSlotDto[];

  @ApiProperty({
    description: 'Resumen de disponibilidad',
  })
  summary: {
    totalSlotsGenerated: number;
    totalAvailableSlots: number;
    totalOccupiedSlots: number;
    availabilityPercentage: number;
    nextAvailableSlot?: string;
    businessStatus: 'open' | 'closed' | 'special_hours';
  };

  @ApiProperty({
    description: 'Citas existentes en la fecha (para contexto)',
    type: [Object],
  })
  existingAppointments: Array<{
    id: number;
    startTime: string;
    endTime: string;
    duration: number;
    serviceTypeName?: string;
    clientName?: string;
    status: string;
  }>;
}

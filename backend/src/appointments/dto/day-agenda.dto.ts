// src/appointments/dto/day-agenda.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentDto } from './appointment.dto';

export enum AgendaSlotType {
  APPOINTMENT = 'appointment',
  AVAILABLE = 'available'
}

export class AgendaSlotDto {
  @ApiProperty({ example: '09:00', description: 'Hora de inicio en formato HH:mm' })
  startTime: string;

  @ApiProperty({ example: '09:30', description: 'Hora de fin en formato HH:mm' })
  endTime: string;

  @ApiProperty({ 
    enum: AgendaSlotType, 
    example: AgendaSlotType.APPOINTMENT,
    description: 'Tipo de slot: cita programada o disponible'
  })
  type: AgendaSlotType;

  @ApiPropertyOptional({ 
    type: AppointmentDto,
    description: 'Detalles de la cita si el slot está ocupado'
  })
  appointment?: AppointmentDto;

  @ApiProperty({ example: 30, description: 'Duración en minutos' })
  duration: number;

  @ApiPropertyOptional({ example: true, description: 'Si este slot está disponible para nuevas citas' })
  isBookable?: boolean;
}

export class BusinessHoursDto {
  @ApiProperty({ example: '08:00', description: 'Hora de apertura en formato HH:mm' })
  start: string;

  @ApiProperty({ example: '18:00', description: 'Hora de cierre en formato HH:mm' })
  end: string;

  @ApiProperty({ example: false, description: 'Si el negocio está cerrado este día' })
  isClosed: boolean;
}

export class DayAgendaDto {
  @ApiProperty({ example: '2024-08-20', description: 'Fecha en formato YYYY-MM-DD' })
  date: string;

  @ApiProperty({ 
    type: BusinessHoursDto,
    description: 'Horarios de negocio para la fecha especificada'
  })
  businessHours: BusinessHoursDto;

  @ApiProperty({ 
    type: [AgendaSlotDto],
    description: 'Agenda completa con citas y espacios disponibles'
  })
  agenda: AgendaSlotDto[];

  @ApiProperty({ example: 5, description: 'Número total de citas para el día' })
  totalAppointments: number;

  @ApiProperty({ example: 12, description: 'Número total de espacios disponibles para el día' })
  totalAvailableSlots: number;

  @ApiProperty({ example: 30, description: 'Duración predeterminada de slot en minutos' })
  slotDuration: number;

  @ApiProperty({ example: 240, description: 'Tiempo total disponible en minutos' })
  totalAvailableTime: number;

  @ApiProperty({ example: 150, description: 'Tiempo total reservado en minutos' })
  totalBookedTime: number;
}

export class GetDayAgendaQueryDto {
  @ApiPropertyOptional({ 
    example: false, 
    description: 'Incluir citas canceladas (solo para dueños del brand)',
    default: false
  })
  includeCancelled?: boolean;
}

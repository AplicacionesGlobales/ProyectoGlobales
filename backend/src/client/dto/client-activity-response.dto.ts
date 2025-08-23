// client/dto/client-activity-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientActivityDto {
  @ApiProperty({ example: 789 })
  id: number;

  @ApiProperty({ example: 'APPOINTMENT_CREATED' })
  type: string;

  @ApiProperty({ example: 'Cita agendada para el 25/08/2024' })
  description: string;

  @ApiProperty({ example: '2024-08-20T10:00:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  createdBy?: string;

  @ApiPropertyOptional({ 
    example: { appointmentId: 456, service: 'Corte de cabello' }
  })
  metadata?: any;
}

export class ClientActivityResponseDto {
  @ApiProperty({ type: [ClientActivityDto] })
  activities: ClientActivityDto[];

  @ApiProperty({ 
    type: 'object',
    properties: {
      total: { type: 'number', example: 100 },
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 10 },
      totalPages: { type: 'number', example: 10 }
    }
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
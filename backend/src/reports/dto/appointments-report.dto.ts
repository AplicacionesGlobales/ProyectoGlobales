import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentsReportDto {
  @ApiPropertyOptional({
    description: 'Fecha inicial (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha final (YYYY-MM-DD)',
    example: '2025-10-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    example: 'CONFIRMED',
    enum: [
      'PENDING',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
      'IN_PROGRESS',
    ],
  })
  @IsOptional()
  @IsString()
  status?: string;
}

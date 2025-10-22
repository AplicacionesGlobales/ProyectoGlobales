import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class KpisQueryDto {
  @ApiProperty({
    description: 'Optional reference date (ISO 8601 format)',
    required: false,
    example: '2025-10-20T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  referenceDate?: string;
}

export class KpisDto {
  @ApiProperty({
    description: 'Average revenue per client',
    example: 150.5,
  })
  averageRevenuePerClient: number;

  @ApiProperty({
    description: 'Total completed appointments',
    example: 245,
  })
  completedAppointments: number;

  @ApiProperty({
    description: 'Total active clients',
    example: 120,
  })
  totalActiveClients: number;

  @ApiProperty({
    description: 'Total revenue',
    example: 18060,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Completion rate (percentage)',
    example: 87.5,
  })
  completionRate: number;
}

export class KpisResponseDto {
  @ApiProperty({
    description: 'Brand ID',
    example: 1,
  })
  brandId: number;

  @ApiProperty({
    description: 'Key Performance Indicators',
    type: KpisDto,
  })
  kpis: KpisDto;
}

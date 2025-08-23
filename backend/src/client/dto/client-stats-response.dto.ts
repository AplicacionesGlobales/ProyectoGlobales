// client/dto/client-stats-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== DTOs BASE ====================

export class AppointmentStatsDto {
  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 20 })
  completed: number;

  @ApiProperty({ example: 3 })
  cancelled: number;

  @ApiProperty({ example: 2 })
  noShow: number;
}

export class RevenueStatsDto {
  @ApiProperty({ example: 2500.00 })
  total: number;

  @ApiProperty({ example: 125.00 })
  average: number;

  @ApiProperty({ example: 350.00 })
  lastPayment: number;
}

// ==================== ESTADÍSTICAS BÁSICAS ====================

export class ClientStatsDto {
  @ApiProperty({ example: 15 })
  totalAppointments: number;

  @ApiPropertyOptional({ example: '2024-08-20T10:00:00Z' })
  lastVisit?: Date;
}

// ==================== ESTADÍSTICAS DETALLADAS ====================

export class ClientStatsResponseDto {
  @ApiProperty({ example: 123 })
  clientId: number;

  @ApiProperty({ example: 456 })
  brandId: number;

  @ApiProperty({ type: AppointmentStatsDto })
  appointments: AppointmentStatsDto;

  @ApiPropertyOptional({ type: RevenueStatsDto })
  revenue?: RevenueStatsDto;

  @ApiPropertyOptional({ example: '2024-08-20T10:00:00Z' })
  lastVisit?: Date;

  @ApiPropertyOptional({ example: '2024-08-25T14:00:00Z' })
  nextAppointment?: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  memberSince: Date;

  @ApiProperty({ example: 'frequent' })
  clientType: 'new' | 'regular' | 'frequent' | 'vip';

  @ApiProperty({ example: 4.5 })
  averageRating: number;

  @ApiPropertyOptional({ example: ['Corte premium', 'Barba'] })
  favoriteServices?: string[];

  @ApiProperty({ example: '30d' })
  period: string;
}

// ==================== TOP CLIENTS ====================

export class TopClientDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'juan.perez@email.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  lastName?: string;

  @ApiProperty({ example: 25 })
  totalAppointments: number;

  @ApiProperty({ example: 2500.00 })
  totalRevenue: number;

  @ApiPropertyOptional({ example: '2024-08-20T10:00:00Z' })
  lastVisit?: Date;

  @ApiProperty({ example: 4.8 })
  averageRating: number;

  @ApiProperty({ example: 'vip' })
  clientType: 'new' | 'regular' | 'frequent' | 'vip';
}

// ==================== RESUMEN DE CLIENTES ====================

export class ClientGrowthDto {
  @ApiProperty({ example: 50 })
  newClients: number;

  @ApiProperty({ example: 10 })
  returningClients: number;

  @ApiProperty({ example: 5 })
  lostClients: number;

  @ApiProperty({ example: 15.5 })
  growthRate: number;
}

export class ClientSegmentationDto {
  @ApiProperty({ example: 20 })
  new: number;

  @ApiProperty({ example: 150 })
  regular: number;

  @ApiProperty({ example: 75 })
  frequent: number;

  @ApiProperty({ example: 25 })
  vip: number;

  @ApiProperty({ example: 30 })
  inactive: number;
}

export class ClientRetentionDto {
  @ApiProperty({ example: 75.5 })
  rate: number;

  @ApiProperty({ example: 3.5 })
  averageVisitsPerClient: number;

  @ApiProperty({ example: 45 })
  averageDaysBetweenVisits: number;
}

export class ClientsSummaryResponseDto {
  @ApiProperty({ example: 300 })
  totalClients: number;

  @ApiProperty({ example: 270 })
  activeClients: number;

  @ApiProperty({ example: 30 })
  inactiveClients: number;

  @ApiProperty({ type: ClientGrowthDto })
  growth: ClientGrowthDto;

  @ApiProperty({ type: ClientSegmentationDto })
  segmentation: ClientSegmentationDto;

  @ApiProperty({ type: ClientRetentionDto })
  retention: ClientRetentionDto;

  @ApiProperty({ example: 125.50 })
  averageClientValue: number;

  @ApiProperty({ example: 85.5 })
  averageSatisfaction: number;

  @ApiProperty({ example: '30d' })
  period: string;

  @ApiProperty({ example: '2024-08-22T10:00:00Z' })
  generatedAt: Date;
}
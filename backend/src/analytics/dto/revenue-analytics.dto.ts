import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

/**
 * DTO para query params del endpoint de revenue analytics
 */
export class RevenueAnalyticsQueryDto {
  @ApiProperty({
    description:
      'Fecha de referencia para calcular métricas (ISO 8601). Si no se proporciona, usa la fecha actual',
    example: '2025-10-20T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  referenceDate?: string;
}

/**
 * DTO para la respuesta de comparación de períodos
 */
export class PeriodComparisonDto {
  @ApiProperty({ description: 'Valor del período actual' })
  current: number;

  @ApiProperty({ description: 'Valor del período anterior' })
  previous: number;

  @ApiProperty({ description: 'Diferencia absoluta (current - previous)' })
  difference: number;

  @ApiProperty({ description: 'Cambio porcentual' })
  percentageChange: number;
}

/**
 * DTO para el desglose de revenue por fuente
 */
export class RevenueBreakdownDto {
  @ApiProperty({ description: 'Ingresos de citas (Appointment.price)' })
  appointments: number;

  @ApiProperty({
    description: 'Ingresos de servicios walk-in (Payment tipo SERVICE)',
  })
  services: number;

  @ApiProperty({ description: 'Ingresos de productos (Payment tipo PRODUCT)' })
  products: number;

  @ApiProperty({ description: 'Total de ingresos' })
  total: number;
}

/**
 * DTO para costos operativos del brand
 */
export class OperatingCostsDto {
  @ApiProperty({
    description:
      'Costo de suscripción a la plataforma (prorrateado según período)',
  })
  subscription: number;
}

/**
 * DTO para métricas financieras completas
 */
export class FinancialMetricsDto {
  @ApiProperty({ description: 'Desglose de ingresos por fuente' })
  revenue: RevenueBreakdownDto;

  @ApiProperty({ description: 'Costos operativos' })
  costs: OperatingCostsDto;

  @ApiProperty({
    description: 'Ganancia neta (revenue.total - costs.subscription)',
  })
  netRevenue: number;
}

/**
 * DTO para métricas diarias
 */
export class DailyRevenueMetricsDto {
  @ApiProperty({ description: 'Ingresos de hoy' })
  today: number;

  @ApiProperty({ description: 'Ingresos de ayer' })
  yesterday: number;

  @ApiProperty({ description: 'Comparativa hoy vs ayer' })
  comparison: PeriodComparisonDto;

  @ApiProperty({ description: 'Fecha de referencia (ISO 8601)' })
  date: string;
}

/**
 * DTO para métricas semanales
 */
export class WeeklyRevenueMetricsDto {
  @ApiProperty({ description: 'Ingresos de la semana actual' })
  currentWeek: number;

  @ApiProperty({ description: 'Ingresos de la semana anterior' })
  previousWeek: number;

  @ApiProperty({ description: 'Comparativa semana actual vs anterior' })
  comparison: PeriodComparisonDto;

  @ApiProperty({ description: 'Fecha de inicio de la semana (ISO 8601)' })
  weekStartDate: string;

  @ApiProperty({ description: 'Fecha de fin de la semana (ISO 8601)' })
  weekEndDate: string;
}

/**
 * DTO para métricas mensuales
 */
export class MonthlyRevenueMetricsDto {
  @ApiProperty({ description: 'Ingresos del mes actual' })
  currentMonth: number;

  @ApiProperty({ description: 'Ingresos del mes anterior' })
  previousMonth: number;

  @ApiProperty({ description: 'Comparativa mes actual vs anterior' })
  comparison: PeriodComparisonDto;

  @ApiProperty({ description: 'Mes (formato YYYY-MM)' })
  month: string;

  @ApiProperty({ description: 'Año' })
  year: number;
}

/**
 * DTO para métricas anuales
 */
export class AnnualRevenueMetricsDto {
  @ApiProperty({ description: 'Ingresos del año actual' })
  currentYear: number;

  @ApiProperty({ description: 'Ingresos del año anterior' })
  previousYear: number;

  @ApiProperty({ description: 'Comparativa año actual vs anterior' })
  comparison: PeriodComparisonDto;

  @ApiProperty({ description: 'Año' })
  year: number;
}

/**
 * DTO para el desglose de revenue por período
 */
export class PeriodBreakdownDto {
  @ApiProperty({ description: 'Métricas financieras del día' })
  daily: FinancialMetricsDto;

  @ApiProperty({ description: 'Métricas financieras de la semana' })
  weekly: FinancialMetricsDto;

  @ApiProperty({ description: 'Métricas financieras del mes' })
  monthly: FinancialMetricsDto;

  @ApiProperty({ description: 'Métricas financieras del año' })
  annual: FinancialMetricsDto;
}

/**
 * DTO principal para la respuesta de revenue analytics
 */
export class RevenueAnalyticsResponseDto {
  @ApiProperty({ description: 'ID del brand' })
  brandId: number;

  @ApiProperty({ description: 'Nombre del brand' })
  brandName: string;

  @ApiProperty({ description: 'Moneda (código ISO)' })
  currency: string;

  @ApiProperty({
    description: 'Timestamp de generación del reporte (ISO 8601)',
  })
  generatedAt: string;

  @ApiProperty({ description: 'Métricas diarias' })
  daily: DailyRevenueMetricsDto;

  @ApiProperty({ description: 'Métricas semanales' })
  weekly: WeeklyRevenueMetricsDto;

  @ApiProperty({ description: 'Métricas mensuales' })
  monthly: MonthlyRevenueMetricsDto;

  @ApiProperty({ description: 'Métricas anuales' })
  annual: AnnualRevenueMetricsDto;

  @ApiProperty({ description: 'Desglose de ingresos por fuente y período' })
  breakdown: PeriodBreakdownDto;
}

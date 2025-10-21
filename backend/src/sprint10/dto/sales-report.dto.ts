// src/sprint10/dto/sales-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsPositive } from 'class-validator';

export enum ReportPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL = 'all'
}

export class SalesReportRequestDto {
  @ApiProperty({
    description: 'ID de la marca para generar el reporte',
    example: 1,
    type: 'number'
  })
  @IsInt()
  @IsPositive()
  id_brand: number;

  @ApiProperty({
    description: 'Período del reporte a generar',
    enum: ReportPeriod,
    enumName: 'ReportPeriod',
    example: ReportPeriod.MONTHLY,
    required: true,
    type: 'string',
    examples: {
      semanal: {
        value: ReportPeriod.WEEKLY,
        summary: 'Última Semana',
        description: 'Genera reporte de los últimos 7 días'
      },
      mensual: {
        value: ReportPeriod.MONTHLY,
        summary: 'Último Mes',
        description: 'Genera reporte de los últimos 30 días'
      },
      historico: {
        value: ReportPeriod.ALL,
        summary: 'Todo el Histórico',
        description: 'Genera reporte de todos los registros disponibles'
      }
    }
  })
  @IsEnum(ReportPeriod, {
    message: 'El período debe ser: weekly (última semana), monthly (último mes) o all (todo el histórico)'
  })
  period: ReportPeriod;
}

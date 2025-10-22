import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PublicAvailableTimeSlotsDto {
  @ApiProperty({
    example: '2024-08-20',
    description: 'Fecha para consultar disponibilidad (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Duración deseada en minutos',
    type: Number,
  })
  @Type(() => Number) // Transformar string a número
  @IsNumber()
  @Min(15)
  @Max(480)
  @IsOptional()
  duration?: number;
}

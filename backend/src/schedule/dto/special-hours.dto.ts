// src/schedule/dto/special-hours.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class SpecialHoursDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024-01-15' })
  date: string;

  @ApiProperty({ example: false })
  isOpen: boolean;

  @ApiPropertyOptional({ example: '09:00' })
  openTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  closeTime?: string;

  @ApiPropertyOptional({ example: 'Día festivo' })
  reason?: string;

  @ApiPropertyOptional({ example: 'Cerrado por día de independencia' })
  description?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

export class CreateSpecialHoursDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional({ example: '09:00' })
  @IsString()
  @IsOptional()
  openTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsString()
  @IsOptional()
  closeTime?: string;

  @ApiPropertyOptional({ example: 'Día festivo' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'Cerrado por día de independencia' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSpecialHoursDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional({ example: '09:00' })
  @IsString()
  @IsOptional()
  openTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsString()
  @IsOptional()
  closeTime?: string;

  @ApiPropertyOptional({ example: 'Día festivo' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'Cerrado por día de independencia' })
  @IsString()
  @IsOptional()
  description?: string;
}
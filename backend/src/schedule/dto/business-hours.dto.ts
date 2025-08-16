// src/schedule/dto/business-hours.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessHoursDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 1, description: '0=Domingo, 1=Lunes, ..., 6=Sábado' })
  @IsNumber()
  dayOfWeek: number;

  @ApiPropertyOptional({ example: 'Lunes' })
  @IsString()
  @IsOptional()
  dayName?: string;

  @ApiProperty({ example: true })
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
}

export class UpdateBusinessHoursDto {
  @ApiProperty({ type: [BusinessHoursDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  businessHours: BusinessHoursDto[];
}
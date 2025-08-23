import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  CREATED_AT = 'createdAt',
  FIRST_NAME = 'firstName',
  EMAIL = 'email',
  LAST_VISIT = 'lastVisit',
  TOTAL_APPOINTMENTS = 'totalAppointments'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class ClientFilters {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'juan' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ enum: SortBy, example: SortBy.CREATED_AT })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
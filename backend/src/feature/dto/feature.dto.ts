import { IsString, IsNumber, IsBoolean, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeatureCategory {
  ESSENTIAL = 'ESSENTIAL',
  BUSINESS = 'BUSINESS',
  ADVANCED = 'ADVANCED',
}

export class FeatureDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'appointments' })
  key: string;

  @ApiProperty({ example: 'Appointment System' })
  title: string;

  @ApiPropertyOptional({ example: 'Sistema de Citas' })
  subtitle?: string;

  @ApiProperty({ example: 'Online appointment scheduling and management' })
  description: string;

  @ApiProperty({ example: 15.00 })
  price: number;

  @ApiProperty({ enum: FeatureCategory, example: FeatureCategory.ESSENTIAL })
  category: FeatureCategory;

  @ApiProperty({ example: true })
  isRecommended: boolean;

  @ApiProperty({ example: true })
  isPopular: boolean;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiPropertyOptional({ example: ['photographer', 'masseur'] })
  businessTypes?: string[];

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class CreateFeatureDto {
  @ApiProperty({ example: 'appointments' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Appointment System' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Sistema de Citas' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: 'Online appointment scheduling and management' })
  @IsString()
  description: string;

  @ApiProperty({ example: 15.00 })
  @IsNumber()
  price: number;

  @ApiProperty({ enum: FeatureCategory, example: FeatureCategory.ESSENTIAL })
  @IsEnum(FeatureCategory)
  category: FeatureCategory;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: ['photographer', 'masseur'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  businessTypes?: string[];
}

export class UpdateFeatureDto extends CreateFeatureDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class FeaturesByBusinessTypeDto {
  @ApiProperty({ example: 'photographer' })
  @IsString()
  businessType: string;
}

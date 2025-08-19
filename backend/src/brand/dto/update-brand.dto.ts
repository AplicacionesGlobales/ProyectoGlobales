import { IsString, IsOptional, ValidateNested, IsObject, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateColorsPaletteDto {
  @ApiPropertyOptional({ example: '#1E3A8A' })
  @IsString()
  @IsOptional()
  primary?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsString()
  @IsOptional()
  secondary?: string;

  @ApiPropertyOptional({ example: '#60A5FA' })
  @IsString()
  @IsOptional()
  accent?: string;

  @ApiPropertyOptional({ example: '#93C5FD' })
  @IsString()
  @IsOptional()
  neutral?: string;

  @ApiPropertyOptional({ example: '#DBEAFE' })
  @IsString()
  @IsOptional()
  success?: string;
}

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Mi Nueva Empresa' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Nueva descripción de mi empresa' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Nueva dirección 456' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+506 9999-9999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 19, description: 'ID del nuevo tipo de negocio' })
  @IsNumber()
  @IsOptional()
  businessTypeId?: number;

  @ApiPropertyOptional({ 
    example: [236, 237, 240], 
    description: 'Array de IDs de features a activar/desactivar' 
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  selectedFeatureIds?: number[];

  @ApiPropertyOptional({ type: UpdateColorsPaletteDto })
  @ValidateNested()
  @Type(() => UpdateColorsPaletteDto)
  @IsObject()
  @IsOptional()
  colorPalette?: UpdateColorsPaletteDto;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
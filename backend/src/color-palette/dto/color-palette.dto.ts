import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Matches } from 'class-validator';

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export class CreateColorPaletteDto {
  @ApiProperty({
    description: 'Primary color in hex format',
    example: '#8B5CF6',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Primary color must be a valid hex color (e.g., #FF5733)' })
  primary: string;

  @ApiProperty({
    description: 'Secondary color in hex format',
    example: '#EC4899',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Secondary color must be a valid hex color (e.g., #FF5733)' })
  secondary: string;

  @ApiProperty({
    description: 'Accent color in hex format',
    example: '#F59E0B',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Accent color must be a valid hex color (e.g., #FF5733)' })
  accent: string;

  @ApiProperty({
    description: 'Neutral color in hex format',
    example: '#10B981',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Neutral color must be a valid hex color (e.g., #FF5733)' })
  neutral: string;

  @ApiProperty({
    description: 'Success color in hex format',
    example: '#3B82F6',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Success color must be a valid hex color (e.g., #FF5733)' })
  success: string;

  @ApiProperty({
    description: 'Brand ID associated with this color palette',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  brandId: number;
}

export class UpdateColorPaletteDto {
  @ApiProperty({
    description: 'Primary color in hex format',
    example: '#8B5CF6',
    required: false,
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'Primary color must be a valid hex color (e.g., #FF5733)' })
  primary?: string;

  @ApiProperty({
    description: 'Secondary color in hex format',
    example: '#EC4899',
    required: false,
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'Secondary color must be a valid hex color (e.g., #FF5733)' })
  secondary?: string;

  @ApiProperty({
    description: 'Accent color in hex format',
    example: '#F59E0B',
    required: false,
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'Accent color must be a valid hex color (e.g., #FF5733)' })
  accent?: string;

  @ApiProperty({
    description: 'Neutral color in hex format',
    example: '#10B981',
    required: false,
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'Neutral color must be a valid hex color (e.g., #FF5733)' })
  neutral?: string;

  @ApiProperty({
    description: 'Success color in hex format',
    example: '#3B82F6',
    required: false,
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: 'Success color must be a valid hex color (e.g., #FF5733)' })
  success?: string;
}

export class ColorPaletteValidationDto {
  @ApiProperty({
    description: 'Primary color in hex format',
    example: '#8B5CF6',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Primary color must be a valid hex color (e.g., #FF5733)' })
  primary: string;

  @ApiProperty({
    description: 'Secondary color in hex format',
    example: '#EC4899',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Secondary color must be a valid hex color (e.g., #FF5733)' })
  secondary: string;

  @ApiProperty({
    description: 'Accent color in hex format',
    example: '#F59E0B',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Accent color must be a valid hex color (e.g., #FF5733)' })
  accent: string;

  @ApiProperty({
    description: 'Neutral color in hex format',
    example: '#10B981',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Neutral color must be a valid hex color (e.g., #FF5733)' })
  neutral: string;

  @ApiProperty({
    description: 'Success color in hex format',
    example: '#3B82F6',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(HEX_COLOR_REGEX, { message: 'Success color must be a valid hex color (e.g., #FF5733)' })
  success: string;
}

export class ColorPaletteResponseDto {
  @ApiProperty({ description: 'Color palette ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Primary color', example: '#8B5CF6' })
  primary: string;

  @ApiProperty({ description: 'Secondary color', example: '#EC4899' })
  secondary: string;

  @ApiProperty({ description: 'Accent color', example: '#F59E0B' })
  accent: string;

  @ApiProperty({ description: 'Neutral color', example: '#10B981' })
  neutral: string;

  @ApiProperty({ description: 'Success color', example: '#3B82F6' })
  success: string;

  @ApiProperty({ description: 'Brand ID', example: 1 })
  brandId: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

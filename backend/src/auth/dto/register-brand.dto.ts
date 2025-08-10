import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  MinLength, 
  IsHexColor,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ColorPaletteDto {
  @ApiProperty({ description: 'Color primario en formato hexadecimal', example: '#8B5CF6' })
  @IsHexColor({ message: 'Color primario debe ser un color hexadecimal válido' })
  @IsNotEmpty({ message: 'Color primario es requerido' })
  primary: string;

  @ApiProperty({ description: 'Color secundario en formato hexadecimal', example: '#EC4899' })
  @IsHexColor({ message: 'Color secundario debe ser un color hexadecimal válido' })
  @IsNotEmpty({ message: 'Color secundario es requerido' })
  secondary: string;

  @ApiProperty({ description: 'Color de acento en formato hexadecimal', example: '#F59E0B' })
  @IsHexColor({ message: 'Color de acento debe ser un color hexadecimal válido' })
  @IsNotEmpty({ message: 'Color de acento es requerido' })
  accent: string;

  @ApiProperty({ description: 'Color neutral en formato hexadecimal', example: '#6B7280' })
  @IsHexColor({ message: 'Color neutral debe ser un color hexadecimal válido' })
  @IsNotEmpty({ message: 'Color neutral es requerido' })
  neutral: string;

  @ApiProperty({ description: 'Color de éxito en formato hexadecimal', example: '#10B981' })
  @IsHexColor({ message: 'Color de éxito debe ser un color hexadecimal válido' })
  @IsNotEmpty({ message: 'Color de éxito es requerido' })
  success: string;
}

class UserInfoDto {
  @ApiProperty({ description: 'Email del usuario ROOT', example: 'owner@business.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({ description: 'Username único del usuario', example: 'owner_business' })
  @IsString({ message: 'Username debe ser texto' })
  @IsNotEmpty({ message: 'Username es requerido' })
  @MinLength(3, { message: 'Username debe tener al menos 3 caracteres' })
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'SecurePass123!' })
  @IsString({ message: 'Contraseña debe ser texto' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({ description: 'Nombre del usuario', example: 'Juan' })
  @IsOptional()
  @IsString({ message: 'Nombre debe ser texto' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsOptional()
  @IsString({ message: 'Apellido debe ser texto' })
  lastName?: string;
}

class BrandInfoDto {
  @ApiProperty({ description: 'Nombre de la marca', example: 'Mi Fotografía Profesional' })
  @IsString({ message: 'Nombre de la marca debe ser texto' })
  @IsNotEmpty({ message: 'Nombre de la marca es requerido' })
  @MinLength(2, { message: 'Nombre de la marca debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la marca', example: 'Servicios profesionales de fotografía para eventos especiales' })
  @IsOptional()
  @IsString({ message: 'Descripción debe ser texto' })
  description?: string;

  @ApiPropertyOptional({ description: 'Dirección física del negocio', example: 'Av. Principal 123, Ciudad' })
  @IsOptional()
  @IsString({ message: 'Dirección debe ser texto' })
  address?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto', example: '+1 234 567 8900' })
  @IsOptional()
  @IsString({ message: 'Teléfono debe ser texto' })
  phone?: string;
}

export class RegisterBrandDto {
  @ApiProperty({ description: 'Información del usuario ROOT que será propietario de la marca', type: UserInfoDto })
  @ValidateNested()
  @Type(() => UserInfoDto)
  user: UserInfoDto;

  @ApiProperty({ description: 'Información de la marca a crear', type: BrandInfoDto })
  @ValidateNested()
  @Type(() => BrandInfoDto)
  brand: BrandInfoDto;

  @ApiProperty({ description: 'Paleta de colores para la marca', type: ColorPaletteDto })
  @ValidateNested()
  @Type(() => ColorPaletteDto)
  colorPalette: ColorPaletteDto;

  @ApiPropertyOptional({ 
    description: 'Funciones seleccionadas para la aplicación',
    example: ['citas', 'pagos', 'archivos'],
    isArray: true
  })
  @IsOptional()
  @IsArray({ message: 'Las funciones deben ser un array' })
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true, message: 'Cada función debe ser una cadena de texto' })
  selectedFeatures?: string[];

  @ApiPropertyOptional({ 
    description: 'Tipo de plan seleccionado',
    example: 'monthly',
    enum: ['monthly', 'annual']
  })
  @IsOptional()
  @IsString({ message: 'Tipo de plan debe ser texto' })
  planType?: 'monthly' | 'annual';
}

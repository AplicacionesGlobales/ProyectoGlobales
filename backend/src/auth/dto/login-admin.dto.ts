import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthResponse } from './auth-response.dto';

export class LoginAdminDto {
  @ApiProperty({
    example: 'admin@company.com',
    description: 'Email del usuario administrador'
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Contraseña del usuario'
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la marca a la que se quiere acceder (opcional para ADMIN/ROOT)'
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la marca debe ser un número entero' })
  brandId?: number;
}

export class LoginClientDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario cliente'
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Contraseña del usuario'
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la marca a la que se quiere acceder'
  })
  @IsInt({ message: 'El ID de la marca debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la marca es requerido' })
  brandId: number;
}

export class LoginResponseDto {
  success: boolean;
  message?: string;
}

// Actualizar AuthResponse para incluir información de marca para ADMIN/ROOT
export class AdminAuthResponse extends AuthResponse {
  brands?: Array<{
    id: number;
    name: string;
    description?: string;
    isOwner: boolean;
  }>;
  selectedBrand?: {
    id: number;
    name: string;
    description?: string;
  };
}
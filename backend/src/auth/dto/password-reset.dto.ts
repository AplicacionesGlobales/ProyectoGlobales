// dtos/forgot-password.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

// Nuevo DTO para validar código
export class ValidateResetCodeDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'El código es requerido' })
  code: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;
}

export class ValidateCodeResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  userId?: number;

  @ApiProperty({ required: false })
  email?: string;
}

// DTO actualizado para reset de contraseña
export class ResetPasswordDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'El código es requerido' })
  code: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ example: 'nuevaContraseña123' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({ example: 'nuevaContraseña123' })
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  confirmPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  errors?: { [key: string]: string[] };
}
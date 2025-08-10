// auth/dto/password-reset.dto.ts
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'Email del usuario que quiere resetear su contraseña'
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;
}

export class ValidateResetTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de reset de contraseña'
  })
  @IsString({ message: 'Token es requerido' })
  token: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de reset de contraseña'
  })
  @IsString({ message: 'Token es requerido' })
  token: string;

  @ApiProperty({ 
    example: 'NuevaPassword123',
    description: 'Nueva contraseña del usuario'
  })
  @IsString({ message: 'Contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
  })
  password: string;

  @ApiProperty({ 
    example: 'NuevaPassword123',
    description: 'Confirmación de la nueva contraseña'
  })
  @IsString({ message: 'Confirmación de contraseña es requerida' })
  confirmPassword: string;
}

// Response DTOs
export class ForgotPasswordResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

export class ValidateTokenResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty({ required: false })
  userId?: number;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  message: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  errors?: { [key: string]: string[] };
}
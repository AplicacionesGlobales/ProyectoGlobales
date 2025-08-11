import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsNumber } from 'class-validator';

export class ValidateEmailDto {
  @ApiProperty({
    example: 'pablo@gmail.com',
    description: 'Email a validar'
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la marca para validación específica (opcional para ROOT/ADMIN)',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'El brandId debe ser un número' })
  brandId?: number;
}

export class EmailValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si el email está disponible para registro'
  })
  isAvailable: boolean;

  @ApiProperty({
    example: 'pablo@gmail.com',
    description: 'El email que se validó'
  })
  email: string;
}

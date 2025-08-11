import { IsEmail, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ValidateEmailDto {
  @ApiProperty({ 
    description: 'Email a validar',
    example: 'usuario@ejemplo.com'
  })
  @IsEmail({}, { message: 'Email debe tener formato válido' })
  email: string;

  @ApiPropertyOptional({ 
    description: 'ID de la marca (para validar clientes)',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'brandId debe ser un número' })
  @Min(1, { message: 'brandId debe ser mayor a 0' })
  brandId?: number;
}

export class EmailValidationResponseDto {
  @ApiProperty({ 
    description: 'Si el email está disponible para registro',
    example: true
  })
  isAvailable: boolean;
}

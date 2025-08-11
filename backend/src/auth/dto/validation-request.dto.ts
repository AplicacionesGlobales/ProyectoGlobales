import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsNumber } from 'class-validator';

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

export class ValidateUsernameDto {
  @ApiProperty({
    example: 'pablo123',
    description: 'Username a validar'
  })
  @IsString({ message: 'El username debe ser un texto' })
  username: string;
}

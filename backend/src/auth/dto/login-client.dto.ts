import { IsEmail, IsString, MinLength, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginClientDto {
  @ApiProperty({
    example: 'user@brand.com',
    description: 'Email del usuario en la marca específica'
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'UserPassword123!',
    description: 'Contraseña del usuario para esta marca'
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

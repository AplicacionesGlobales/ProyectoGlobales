import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';
import {
  ApiEmail,
  ApiUsername,
  ApiPassword,
  ApiFirstName,
  ApiLastName,
  ApiBranchId,
} from '../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientDto {
  @ApiEmail()
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'juanperez123',
    minLength: 3,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser una cadena de texto' })
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El username no puede tener más de 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @ApiPassword()
  @IsString({ message: 'Contraseña debe ser texto' })
  @MinLength(6, { message: 'Contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiFirstName()
  @IsOptional()
  @IsString({ message: 'Nombre debe ser texto' })
  firstName?: string;

  @ApiLastName()
  @IsOptional()
  @IsString({ message: 'Apellido debe ser texto' })
  lastName?: string;

  @ApiBranchId()
  @IsInt({ message: 'ID de sucursal debe ser un número' })
  @IsNotEmpty({ message: 'ID de sucursal es requerido' })
  branchId: number;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsInt } from 'class-validator';
import { ApiEmail, ApiUsername, ApiPassword, ApiFirstName, ApiLastName, ApiBranchId } from '../../common/decorators';

export class RegisterClientDto {
  @ApiEmail()
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiUsername()
  @IsString({ message: 'Username debe ser texto' })
  @IsNotEmpty({ message: 'Username es requerido' })
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

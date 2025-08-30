// src/auth/dto/update-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, Matches, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Nombre del usuario', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @ApiProperty({ description: 'Apellido del usuario', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @ApiProperty({ description: 'Teléfono del usuario', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[+]?[\d\s\-()]{10,20}$/, {
    message: 'El formato del teléfono no es válido',
  })
  phone?: string;

  @ApiProperty({ 
    description: 'Nombre de usuario único', 
    example: 'nuevousuario123', 
    required: false,
    minLength: 3, 
    maxLength: 20 
  })
  @IsOptional()
  @IsString({ message: 'El username debe ser una cadena de texto' })
  @Length(3, 20, { message: 'El username debe tener entre 3 y 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username?: string;
}
// client/dto/update-client-profile.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClientProfileDto {
  @ApiPropertyOptional({
    example: 'Juan Carlos',
    description: 'Nombre del cliente',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Pérez González',
    description: 'Apellido del cliente',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    example: '+50688889999',
    description: 'Número de teléfono del cliente',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono inválido' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'cliente.nuevo@ejemplo.com',
    description: 'Email del cliente',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}

// client/dto/create-client.dto.ts

import { IsString, IsEmail, IsOptional, IsBoolean, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'cliente@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '+50688887777' })
  @IsString()
  @IsOptional()  // 🔧 Agregado IsOptional
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono inválido' })
  phone?: string;  // 🔧 Agregado ? para hacerlo opcional

  @ApiPropertyOptional({ example: 'Cliente preferencial, alérgico a ciertos productos' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  createAccess?: boolean;

  @ApiPropertyOptional({ example: 'TempPass123!' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  tempPassword?: string;
}
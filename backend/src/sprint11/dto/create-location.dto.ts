// src/sprint11/dto/create-location.dto.ts
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Latitud geográfica en grados decimales',
    example: 9.9281,
    minimum: -90,
    maximum: 90,
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitud geográfica en grados decimales',
    example: -84.0907,
    minimum: -180,
    maximum: 180,
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Dirección física completa',
    example: 'Avenida Central, Calle 5, San José',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Ciudad o localidad',
    example: 'San José',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'País',
    example: 'Costa Rica',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Código postal',
    example: '10101',
    required: false,
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({
    description: 'Notas adicionales sobre la ubicación',
    example: 'Oficina principal, segundo piso, frente al parque',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

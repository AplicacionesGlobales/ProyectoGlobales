// backend/src/payment/payment-tilopay/dto/create-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'Mi Negocio SA', description: 'Nombre de la marca o negocio' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'contacto@minegocio.com', description: 'Email de contacto' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '88888888', description: 'Teléfono de contacto' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Juan Perez', description: 'Nombre del propietario' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: 'San José, Costa Rica', description: 'Ubicación del negocio', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'app', description: 'Tipo de plan (web, app, completo)' })
  @IsString()
  @IsNotEmpty()
  planType: string;

  @ApiProperty({ example: 'monthly', description: 'Ciclo de facturación (monthly, annual)' })
  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @ApiProperty({ 
    example: ['citas', 'pagos'], 
    description: 'Servicios adicionales seleccionados', 
    required: false 
  })
  @IsArray()
  @IsOptional()
  selectedServices?: string[];
}
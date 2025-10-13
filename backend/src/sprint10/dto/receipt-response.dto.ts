// src/sprint10/dto/receipt-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsDecimal, IsDateString } from 'class-validator';

export class ReceiptResponseDto {
  @ApiProperty({
    description: 'ID del payment',
    example: 1
  })
  @IsNumber()
  paymentId: number;

  @ApiProperty({
    description: 'Monto del pago',
    example: '50.00'
  })
  @IsDecimal()
  amount: string;

  @ApiProperty({
    description: 'Moneda',
    example: 'CRC'
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Estado del pago',
    example: 'completed'
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-10-13T00:00:00.000Z'
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Datos del brand'
  })
  brand: {
    id: number;
    name: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Método de pago',
    example: 'credit_card',
    required: false
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Referencia de Tilopay',
    required: false
  })
  @IsOptional()
  @IsString()
  tilopayReference?: string;
}
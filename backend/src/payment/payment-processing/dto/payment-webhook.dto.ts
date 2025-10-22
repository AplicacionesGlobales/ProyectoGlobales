// backend/src/payment/payment-processing/dto/payment-webhook.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export enum WebhookEventType {
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
}

export class PaymentWebhookDto {
  @ApiProperty({ example: 'payment.completed', description: 'Tipo de evento' })
  @IsEnum(WebhookEventType)
  @IsNotEmpty()
  event: WebhookEventType;

  @ApiProperty({
    example: 'TLP-123456',
    description: 'ID de transacción de Tilopay',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ example: 'ORDER-1234567890', description: 'Número de orden' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({ example: 'completed', description: 'Estado del pago' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 100.5, description: 'Monto del pago' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'USD', description: 'Moneda' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 'AUTH-123',
    description: 'Código de autorización',
    required: false,
  })
  @IsString()
  @IsOptional()
  authCode?: string;

  @ApiProperty({
    example: '2025-09-29T10:00:00Z',
    description: 'Fecha de procesamiento',
    required: false,
  })
  @IsString()
  @IsOptional()
  processedAt?: string;

  @ApiProperty({ description: 'Metadata adicional', required: false })
  @IsOptional()
  metadata?: any;
}

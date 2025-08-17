// backend/src/validate/dto/validate-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ValidatePaymentDto {
  @ApiProperty({
    example: 1,
    description: 'ID del brand a validar'
  })
  @IsNumber()
  brandId: number;
}

export class PaymentValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si el pago está completo'
  })
  isPaymentComplete: boolean;

  @ApiProperty({
    example: 'completed',
    description: 'Estado del pago (completed, pending, failed)'
  })
  paymentStatus: string;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Fecha de vencimiento del pago si está pendiente',
    required: false
  })
  dueDate?: string;

  @ApiProperty({
    description: 'Información del brand para facilitar el pago',
    required: false
  })
  brandInfo?: {
    id: number;
    name: string;
    phone?: string;
    owner?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    plan?: {
      type: string;
      billingCycle: string;
    };
  };
}
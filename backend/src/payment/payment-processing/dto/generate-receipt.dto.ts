// backend/src/payment/payment-processing/dto/generate-receipt.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GenerateReceiptDto {
  @ApiProperty({ example: 1, description: 'ID del pago' })
  @IsInt()
  @IsNotEmpty()
  paymentId: number;
}
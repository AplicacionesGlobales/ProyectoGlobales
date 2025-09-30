// backend/src/payment/payment-processing/payment-processing.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentProcessingController } from './payment-processing.controller';
import { PaymentProcessingService } from './payment-processing.service';
import { ReceiptGeneratorService } from './receipt-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule],
  controllers: [PaymentProcessingController],
  providers: [PaymentProcessingService, ReceiptGeneratorService],
  exports: [PaymentProcessingService, ReceiptGeneratorService],
})
export class PaymentProcessingModule {}
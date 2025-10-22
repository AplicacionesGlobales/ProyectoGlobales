import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from './services/file.service';
import { PlanService } from './services/plan.service';
import { PaymentService } from './services/payment.service';
import { PricingService } from './services/pricing.service';
import { EmailService } from './services/email/email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    FileService,
    PlanService,
    PaymentService,
    PricingService,
    EmailService,
  ],
  exports: [
    PrismaService,
    FileService,
    PlanService,
    PaymentService,
    PricingService,
    EmailService,
  ],
})
export class CommonModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from './services/file.service';
import { PlanService } from './services/plan.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    FileService,
    PlanService,
    PaymentService
  ],
  exports: [
    PrismaService,
    FileService,
    PlanService,
    PaymentService
  ]
})
export class CommonModule {}

import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, BrandOwnerGuard],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

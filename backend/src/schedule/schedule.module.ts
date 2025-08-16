// src/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [PrismaModule, BrandModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService]
})
export class ScheduleModule {}
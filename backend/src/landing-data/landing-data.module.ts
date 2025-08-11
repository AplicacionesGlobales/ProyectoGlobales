import { Module } from '@nestjs/common';
import { LandingDataController } from './landing-data.controller';
import { LandingDataService } from './landing-data.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LandingDataController],
  providers: [LandingDataService, PrismaService],
  exports: [LandingDataService],
})
export class LandingDataModule {}

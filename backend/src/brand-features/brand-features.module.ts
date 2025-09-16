// src/brand-features/brand-features.module.ts
import { Module } from '@nestjs/common';
import { BrandFeaturesController } from './brand-features.controller';
import { BrandFeaturesService } from './brand-features.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BrandFeaturesController],
  providers: [BrandFeaturesService],
  exports: [BrandFeaturesService]
})
export class BrandFeaturesModule {}
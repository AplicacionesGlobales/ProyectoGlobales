import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileService } from '../common/services/file.service';
import { BrandOwnerGuard } from './guards/brand-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController],
  providers: [
    BrandService,
    FileService,
    BrandOwnerGuard
  ],
  exports: [BrandService]
})
export class BrandModule {}
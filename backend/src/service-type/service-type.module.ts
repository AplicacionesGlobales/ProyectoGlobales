// src/service-type/service-type.module.ts
import { Module } from '@nestjs/common';
import { ServiceTypeController } from './service-type.controller';
import { ServiceTypeService } from './service-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceTypeController],
  providers: [ServiceTypeService],
  exports: [ServiceTypeService],
})
export class ServiceTypeModule {}

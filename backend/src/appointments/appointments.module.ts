// src/appointments/appointments.module.ts
import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [PrismaModule, BrandModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}
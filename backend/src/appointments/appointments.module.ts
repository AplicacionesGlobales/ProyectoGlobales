// src/appointments/appointments.module.ts
import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandModule } from '../brand/brand.module';
import { CommonModule } from '../common/common.module';
import { AppointmentStatusManagerService } from './appointment-status-manager.service';

@Module({
  imports: [PrismaModule, BrandModule, CommonModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentStatusManagerService
  ],
  exports: [AppointmentsService, AppointmentStatusManagerService]
})
export class AppointmentsModule {}
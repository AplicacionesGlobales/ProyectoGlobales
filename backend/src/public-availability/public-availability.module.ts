import { Module } from '@nestjs/common';
import { PublicAvailabilityController } from './public-availability.controller';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [AppointmentsModule],
  controllers: [PublicAvailabilityController],
})
export class PublicAvailabilityModule {}

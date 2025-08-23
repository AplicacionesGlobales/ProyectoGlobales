import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { BrandRegistrationModule } from './brand-register/brand-registration.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';
import { LandingDataModule } from './landing-data/landing-data.module';
import { ValidateModule } from './validate/validate.module';
import { ColorPaletteModule } from './color-palette/color-palette.module';
import { FilesModule } from './files/files.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { BrandModule } from './brand/brand.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    PrismaModule,
    AuthModule,
    BrandModule,
    BrandRegistrationModule,
    PaymentModule,
    LandingDataModule,
    ValidateModule,
    ScheduleModule,
    ColorPaletteModule,
    FilesModule,
    AppointmentsModule,
    ClientModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module'; 
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';
import { LandingDataModule } from './landing-data/landing-data.module';
import { ValidateModule } from './validate/validate.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule, 
    HealthModule, 
    AuthModule, 
    PaymentModule,
    LandingDataModule,
    ValidateModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

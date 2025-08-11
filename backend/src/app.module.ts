import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module'; 
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule, 
    HealthModule, 
    AuthModule, 
    PaymentModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

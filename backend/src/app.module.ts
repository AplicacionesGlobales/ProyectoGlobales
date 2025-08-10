import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module'; 
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

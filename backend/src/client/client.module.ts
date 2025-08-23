// client/client.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { ClientValidationService } from './services/client-validation.service';
import { ClientStatsService } from './services/client-stats.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule,
    AuthModule, // Para usar guards y servicios de autenticación
  ],
  controllers: [ClientController],
  providers: [
    ClientService,
    ClientValidationService,
    ClientStatsService,
  ],
  exports: [
    ClientService,
    ClientValidationService,
    ClientStatsService,
  ],
})
export class ClientModule { }
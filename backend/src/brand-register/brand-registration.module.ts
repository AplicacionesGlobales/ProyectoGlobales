import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandRegistrationController } from './brand-registration.controller';
import { BrandRegistrationService } from './brand-registration.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [BrandRegistrationController],
  providers: [
    BrandRegistrationService,
    FileService,
  ],
  exports: [BrandRegistrationService],
})
export class BrandRegistrationModule {}
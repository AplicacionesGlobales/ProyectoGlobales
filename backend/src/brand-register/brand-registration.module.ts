import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandRegistrationController } from './brand-registration.controller';
import { BrandRegistrationService } from './brand-registration.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    FilesModule,
  ],
  controllers: [BrandRegistrationController],
  providers: [
    BrandRegistrationService,
  ],
  exports: [BrandRegistrationService],
})
export class BrandRegistrationModule {}
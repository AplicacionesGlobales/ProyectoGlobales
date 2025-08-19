import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MinioService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [FilesController],
  providers: [MinioService],
  exports: [MinioService],
})
export class FilesModule {}

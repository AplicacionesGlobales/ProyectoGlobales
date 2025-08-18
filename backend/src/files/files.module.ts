import { Module } from '@nestjs/common';
import { MinioService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [MinioService],
  exports: [MinioService],
})
export class FilesModule {}

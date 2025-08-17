import { Module } from '@nestjs/common';
import { ColorPaletteController } from './color-palette.controller';
import { ColorPaletteService } from './color-palette.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ColorPaletteController],
  providers: [ColorPaletteService],
  exports: [ColorPaletteService],
})
export class ColorPaletteModule {}

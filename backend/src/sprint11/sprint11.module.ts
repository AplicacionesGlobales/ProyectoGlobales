// src/sprint11/sprint11.module.ts
import { Module } from '@nestjs/common';
import { Sprint11Controller } from './sprint11.controller';
import { Sprint11Service } from './sprint11.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [Sprint11Controller],
  providers: [Sprint11Service],
  exports: [Sprint11Service],
})
export class Sprint11Module {}

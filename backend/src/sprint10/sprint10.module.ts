// src/sprint10/sprint10.module.ts
import { Module } from '@nestjs/common';
import { Sprint10Controller } from './sprint10.controller';
import { Sprint10Service } from './sprint10.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [Sprint10Controller],
  providers: [Sprint10Service],
  exports: [Sprint10Service],
})
export class Sprint10Module {}

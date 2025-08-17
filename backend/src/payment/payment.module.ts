import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment-tilopay/tilopay.controller';
import { TilopayService } from './payment-tilopay/tilopay.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [HttpModule, ConfigModule, CommonModule],
  controllers: [PaymentController],
  providers: [TilopayService],
  exports: [TilopayService],
})
export class PaymentModule {}

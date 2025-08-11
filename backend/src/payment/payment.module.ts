import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { TilopayService } from './payment-tilopay/tilopay.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PaymentController],
  providers: [TilopayService],
  exports: [TilopayService],
})
export class PaymentModule {}

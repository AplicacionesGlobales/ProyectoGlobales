// backend\src\payment\payment-tilopay\tilopay.controller.ts
import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TilopayService } from './tilopay.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BaseResponseDto } from '../../common/dto';
import { Public } from '../../common/decorators';
import { PaymentCallbackQuery } from './tilopay.types';
import { Response } from 'express';

@ApiTags('Pagos')
@Controller('payment')
@Public() // Todo el controller es público para pagos
export class PaymentController {
  constructor(private readonly tilopayService: TilopayService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear pago con Tilopay' })
  @ApiResponse({ status: 200, description: 'URL de pago generada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto
  ): Promise<BaseResponseDto<any>> {
    return this.tilopayService.createPayment(createPaymentDto);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback de pago de Tilopay' })
  @ApiResponse({ status: 200, description: 'Callback procesado correctamente' })
  async paymentCallback(
    @Query() query: PaymentCallbackQuery,
    @Res() res: Response
  ): Promise<void> {
    await this.tilopayService.handlePaymentCallback(query, res);
  }
}
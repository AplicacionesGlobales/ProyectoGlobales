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
export class PaymentController {
  constructor(private readonly tilopayService: TilopayService) { }

  @Public()
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear pago con Tilopay' })
  @ApiResponse({ status: 200, description: 'URL de pago generada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto
  ): Promise<BaseResponseDto<any>> {
    try {
      console.log('💳 Payment request received:', createPaymentDto);
      
      // Calcular monto total según el plan
      const totalAmount = this.calculateTotalAmount(
        createPaymentDto.planType,
        createPaymentDto.billingCycle,
        createPaymentDto.selectedServices || []
      );

      console.log('💰 Calculated amount:', totalAmount);

      const paymentData = {
        redirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/callback`,
        amount: totalAmount.toFixed(2),
        currency: 'USD',
        orderNumber: `ORDER-${Date.now()}`,
        capture: '1',
        billToFirstName: createPaymentDto.ownerName.split(' ')[0] || 'Cliente',
        billToLastName: createPaymentDto.ownerName.split(' ').slice(1).join(' ') || 'Empresa',
        billToAddress: createPaymentDto.location || 'San José, Costa Rica',
        billToAddress2: 'N/A',
        billToCity: 'San José',
        billToState: 'San José',
        billToZipPostCode: '10101',
        billToCountry: 'CR', // Costa Rica por defecto
        billToTelephone: createPaymentDto.phone || '25001000',
        billToEmail: createPaymentDto.email,
        subscription: '0',
        platform: 'api',
        returnData: Buffer.from(JSON.stringify({
          brandData: createPaymentDto,
          amount: totalAmount,
        })).toString('base64'),
      };

      const result = await this.tilopayService.processPayment(paymentData);

      return BaseResponseDto.success({
        paymentUrl: result.url,
        orderNumber: paymentData.orderNumber,
        amount: totalAmount,
      });
    } catch (error) {
      return BaseResponseDto.error([{
        code: 5000,
        description: 'Error procesando el pago'
      }]);
    }
  }

  private calculateTotalAmount(
    planType: string,
    billingCycle: string,
    selectedServices: string[]
  ): number {
    if (planType === 'web') {
      return 0; // Plan web gratuito
    }

    // Precios base mensuales
    const basePrices = {
      app: 59,
      completo: 60,
    };

    // Precios de servicios mensuales
    const servicePrices: Record<string, number> = {
      citas: 20,
      ubicaciones: 15,
      archivos: 25,
      pagos: 30,
      reportes: 15,
    };

    // Calcular costo base
    const basePrice = basePrices[planType as keyof typeof basePrices] || 0;

    // Calcular costo de servicios
    const servicesPrice = selectedServices.reduce((total, serviceId) => {
      return total + (servicePrices[serviceId] || 0);
    }, 0);

    const monthlyTotal = basePrice + servicesPrice;

    // Si es anual, multiplicar por 12
    return billingCycle === 'annual' ? monthlyTotal * 12 : monthlyTotal;
  }



  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Callback de pago de Tilopay' })
  @ApiResponse({ status: 200, description: 'Callback procesado correctamente' })
  async paymentCallback(
    @Query() query: PaymentCallbackQuery,
    @Res() res: Response
  ): Promise<void> {
    try {
      console.log('📞 Processing payment callback:', query);
      
      // URL base del frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      // Verificar el código de respuesta
      if (query.code === '1') {
        // Pago aprobado
        const returnData = query.returnData ?
          JSON.parse(Buffer.from(query.returnData, 'base64').toString()) : null;

        console.log('✅ Payment approved:', {
          transactionId: query['tilopay-transaction'],
          orderNumber: query.order,
          returnData
        });

        // Aquí puedes actualizar el estado del pago en tu base de datos
        // y realizar otras acciones necesarias

        // Redirigir al frontend con parámetros de éxito
        const callbackUrl = new URL(`${frontendUrl}/payment/callback`);
        callbackUrl.searchParams.set('status', 'completed');
        callbackUrl.searchParams.set('order_id', query.order || '');
        callbackUrl.searchParams.set('transaction_id', query['tilopay-transaction'] || '');
        callbackUrl.searchParams.set('reference', query['tilopay-transaction'] || '');
        
        res.redirect(callbackUrl.toString());
      } else {
        // Pago fallido
        console.log('❌ Payment failed:', {
          code: query.code,
          description: query.description,
          orderNumber: query.order
        });

        // Redirigir al frontend con parámetros de fallo
        const callbackUrl = new URL(`${frontendUrl}/payment/callback`);
        callbackUrl.searchParams.set('status', 'failed');
        callbackUrl.searchParams.set('order_id', query.order || '');
        callbackUrl.searchParams.set('error_code', query.code || '');
        callbackUrl.searchParams.set('error_message', query.description || 'Pago fallido');
        
        res.redirect(callbackUrl.toString());
      }
    } catch (error) {
      console.error('💥 Error processing payment callback:', error);
      
      // Redirigir al frontend con error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const callbackUrl = new URL(`${frontendUrl}/payment/callback`);
      callbackUrl.searchParams.set('status', 'error');
      callbackUrl.searchParams.set('error_message', 'Error procesando el callback de pago');
      
      res.redirect(callbackUrl.toString());
    }
  }

}

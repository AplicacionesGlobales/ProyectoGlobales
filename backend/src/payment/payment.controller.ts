import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TilopayService } from './payment-tilopay/tilopay.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BaseResponseDto } from '../common/dto';

@ApiTags('Pagos')
@Controller('payment')
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
    try {
      // Calcular monto total según el plan
      const totalAmount = this.calculateTotalAmount(
        createPaymentDto.planType,
        createPaymentDto.billingCycle,
        createPaymentDto.selectedServices || []
      );

      const paymentData = {
        redirect: `${process.env.BASE_URL}/payment/callback`,
        amount: totalAmount.toFixed(2),
        currency: 'USD',
        orderNumber: `ORDER-${Date.now()}`,
        capture: '1',
        billToFirstName: createPaymentDto.ownerName.split(' ')[0],
        billToLastName: createPaymentDto.ownerName.split(' ').slice(1).join(' ') || 'N/A',
        billToAddress: createPaymentDto.location || 'N/A',
        billToAddress2: 'N/A',
        billToCity: 'N/A',
        billToState: 'N/A',
        billToZipPostCode: '00000',
        billToCountry: 'CR', // Costa Rica por defecto
        billToTelephone: createPaymentDto.phone,
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
}

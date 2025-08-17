// backend\src\payment\payment-tilopay\tilopay.controller.ts
import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TilopayService } from './tilopay.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BaseResponseDto } from '../../common/dto';
import { Public } from '../../common/decorators';
import { PaymentCallbackQuery } from './tilopay.types';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../../common/services/pricing.service';

@ApiTags('Pagos')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly tilopayService: TilopayService,
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService
  ) { }

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
      
      // Usar PricingService para calcular el monto
      const totalAmount = this.pricingService.calculateTotalPrice(
        createPaymentDto.planType,
        createPaymentDto.selectedServices || [],
        createPaymentDto.billingCycle as 'monthly' | 'annual'
      );

      console.log('💰 Calculated amount using PricingService:', totalAmount);

      const paymentData = {
        redirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/callback`,
        amount: totalAmount.toFixed(2),
        currency: 'USD',
        orderNumber: `ORDER-${Date.now()}`,
        capture: '1',
        billToFirstName: createPaymentDto.ownerName.split(' ')[0] || 'Cliente',
        billToLastName: createPaymentDto.ownerName.split(' ').slice(1).join(' ') || 'Empresa',
        billToAddress: 'San José Centro',
        billToAddress2: 'N/A',
        billToCity: 'San José',
        billToState: 'San José',
        billToZipPostCode: '10101',
        billToCountry: 'CR',
        billToTelephone: createPaymentDto.phone || '25001000',
        billToEmail: createPaymentDto.email,
        subscription: '0',
        platform: 'api',
        returnData: Buffer.from(JSON.stringify({
          brandData: createPaymentDto,
          amount: totalAmount,
          timestamp: new Date().toISOString()
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
      
      // Tilopay envía directamente estos parámetros:
      // - code: '1' para éxito, otros códigos para error
      // - description: descripción del resultado
      // - order: número de orden
      // - tilopay-transaction: ID de transacción
      // - auth: código de autorización
      // - returnData: datos adicionales en base64
      
      const callbackUrl = new URL(`${frontendUrl}/payment/callback`);
      
      // Verificar el código de respuesta
      if (query.code === '1') {
        // Pago aprobado - procesar returnData
        console.log('✅ Payment approved:', {
          transactionId: query['tilopay-transaction'],
          orderNumber: query.order,
          authCode: query.auth,
          description: query.description
        });

        // Procesar returnData para obtener información del brand
        let brandData = null;
        if (query.returnData) {
          try {
            const decoded = Buffer.from(query.returnData, 'base64').toString();
            const parsedData = JSON.parse(decoded);
            brandData = parsedData.brandData;
            console.log('📦 Decoded brand data:', brandData);
          } catch (error) {
            console.error('❌ Error decoding returnData:', error);
          }
        }

        // Actualizar pago en base de datos
        await this.updatePaymentStatus(
          query.order || '', 
          'completed', 
          query['tilopay-transaction'] || '',
          query.auth || '',
          brandData
        );

        // Redirigir al frontend con parámetros mínimos
        callbackUrl.searchParams.set('code', '1');
        callbackUrl.searchParams.set('order', query.order || '');
        callbackUrl.searchParams.set('description', query.description || 'Pago completado');
        
      } else {
        // Pago fallido
        console.log('❌ Payment failed:', {
          code: query.code,
          description: query.description,
          orderNumber: query.order
        });

        // Actualizar pago como fallido
        await this.updatePaymentStatus(
          query.order || '', 
          'failed', 
          undefined,
          undefined,
          undefined,
          query.code,
          query.description
        );

        // Redirigir al frontend con error
        callbackUrl.searchParams.set('code', query.code || '0');
        callbackUrl.searchParams.set('order', query.order || '');
        callbackUrl.searchParams.set('description', query.description || 'Pago fallido');
      }
      
      console.log('🔄 Redirecting to:', callbackUrl.toString());
      res.redirect(callbackUrl.toString());
      
    } catch (error) {
      console.error('💥 Error processing payment callback:', error);
      
      // Redirigir al frontend con error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const callbackUrl = new URL(`${frontendUrl}/payment/callback`);
      callbackUrl.searchParams.set('code', '0');
      callbackUrl.searchParams.set('description', 'Error procesando el callback de pago');
      
      res.redirect(callbackUrl.toString());
    }
  }

  private async updatePaymentStatus(
    orderNumber: string,
    status: 'completed' | 'failed',
    tilopayTransactionId?: string,
    authCode?: string,
    brandData?: any,
    errorCode?: string,
    errorDescription?: string
  ): Promise<void> {
    try {
      console.log('💾 Updating payment status:', {
        orderNumber,
        status,
        tilopayTransactionId,
        brandData
      });

      if (status === 'completed' && brandData) {
        console.log('✅ Processing successful payment...');
        
        // Buscar la marca por email del propietario
        const brand = await this.prisma.brand.findFirst({
          where: {
            userBrands: {
              some: {
                user: {
                  email: brandData.email
                }
              }
            }
          },
          include: {
            brandPlans: {
              where: { isActive: true },
              include: {
                plan: true
              }
            },
            userBrands: {
              include: {
                user: true
              }
            }
          }
        });

        if (brand && brand.brandPlans.length > 0) {
          const brandPlan = brand.brandPlans[0];
          
          console.log(`📋 Brand found: ${brand.name} (ID: ${brand.id})`);
          console.log(`📋 BrandPlan found: ${brandPlan.plan.name} (ID: ${brandPlan.id})`);
          
          // Crear registro de pago
          const payment = await this.prisma.payment.create({
            data: {
              brandId: brand.id,
              brandPlanId: brandPlan.id,
              amount: parseFloat(brandData.amount || '0'),
              currency: 'USD',
              status: 'completed',
              tilopayTransactionId: tilopayTransactionId,
              tilopayReference: orderNumber,
              processedAt: new Date(),
              metadata: {
                authCode: authCode,
                description: 'Pago completado via Tilopay',
                brandData: brandData,
                orderNumber: orderNumber,
                tilopayTransactionId: tilopayTransactionId
              }
            }
          });

          console.log(`✅ Payment record created with ID: ${payment.id}`);
          
          // Actualizar el estado del brandPlan si es necesario
          await this.prisma.brandPlan.update({
            where: { id: brandPlan.id },
            data: {
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días desde ahora
            }
          });
          
          console.log('✅ BrandPlan updated with new end date');
          
        } else {
          console.error('❌ Brand or active plan not found for email:', brandData.email);
          
          // Log adicional para debugging
          if (!brand) {
            console.error('❌ No brand found for email:', brandData.email);
          } else if (brand.brandPlans.length === 0) {
            console.error('❌ No active brandPlans found for brand:', brand.id);
          }
        }
      } else if (status === 'failed') {
        console.log('❌ Processing failed payment...');
        // Para pagos fallidos, podríamos log el intento si es necesario
        // Por ahora solo loggeamos el error
        console.log(`❌ Payment failed for order ${orderNumber}: ${errorCode} - ${errorDescription}`);
      }

    } catch (error) {
      console.error('💥 Error updating payment status:', error);
    }
  }

}

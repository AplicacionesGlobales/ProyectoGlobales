// backend\src\payment\payment-tilopay\tilopay.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Response } from 'express';
import {
  TilopayLoginRequest,
  TilopayLoginResponse,
  TilopayPaymentRequest,
  TilopayPaymentResponse,
  PaymentCallbackQuery,
} from './tilopay.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BaseResponseDto } from '../../common/dto';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../../common/services/pricing.service';

@Injectable()
export class TilopayService {
  private baseUrl: string;
  private apiKey: string;
  private apiUser: string;
  private apiPassword: string;
  private frontendUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {
    this.baseUrl = this.configService.get<string>('TILOPAY_BASE_URL') || '';
    this.apiKey = this.configService.get<string>('TILOPAY_API_KEY') || '';
    this.apiUser = this.configService.get<string>('TILOPAY_API_USER') || '';
    this.apiPassword = this.configService.get<string>('TILOPAY_API_PASSWORD') || '';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<BaseResponseDto<any>> {
    try {
      console.log('💳 Payment request received:', createPaymentDto);
      
      // Calcular el monto total usando PricingService
      const totalAmount = this.pricingService.calculateTotalPrice(
        createPaymentDto.planType,
        createPaymentDto.selectedServices || [],
        createPaymentDto.billingCycle as 'monthly' | 'annual'
      );

      console.log('💰 Calculated amount using PricingService:', totalAmount);

      const paymentData = this.buildPaymentData(createPaymentDto, totalAmount);
      const result = await this.processPayment(paymentData);

      return BaseResponseDto.success({
        paymentUrl: result.url,
        orderNumber: paymentData.orderNumber,
        amount: totalAmount,
      });
    } catch (error) {
      console.error('💥 Error creating payment:', error);
      return BaseResponseDto.error([{
        code: 5000,
        description: 'Error procesando el pago'
      }]);
    }
  }

  async handlePaymentCallback(query: PaymentCallbackQuery, res: Response): Promise<void> {
    try {
      console.log('📞 Processing payment callback:', query);
      
      const callbackUrl = new URL(`${this.frontendUrl}/payment/callback`);
      
      if (query.code === '1') {
        await this.handleSuccessfulPayment(query, callbackUrl);
      } else {
        await this.handleFailedPayment(query, callbackUrl);
      }
      
      console.log('🔄 Redirecting to:', callbackUrl.toString());
      res.redirect(callbackUrl.toString());
      
    } catch (error) {
      console.error('💥 Error processing payment callback:', error);
      this.redirectToErrorPage(res, 'Error procesando el callback de pago');
    }
  }

  private buildPaymentData(createPaymentDto: CreatePaymentDto, totalAmount: number): TilopayPaymentRequest {
    return {
      redirect: `${this.frontendUrl}/payment/callback`,
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
  }

  private async handleSuccessfulPayment(query: PaymentCallbackQuery, callbackUrl: URL): Promise<void> {
    console.log('✅ Payment approved:', {
      transactionId: query['tilopay-transaction'],
      orderNumber: query.order,
      authCode: query.auth,
      description: query.description
    });

    // Procesar returnData
    let brandData = null;
    if (query.returnData) {
      brandData = this.decodeReturnData(query.returnData);
    }

    // Actualizar pago en base de datos
    await this.updatePaymentStatus(
      query.order || '', 
      'completed', 
      query['tilopay-transaction'] || '',
      query.auth || '',
      brandData
    );

    // Configurar parámetros de redirección
    callbackUrl.searchParams.set('code', '1');
    callbackUrl.searchParams.set('order', query.order || '');
    callbackUrl.searchParams.set('description', query.description || 'Pago completado');
  }

  private async handleFailedPayment(query: PaymentCallbackQuery, callbackUrl: URL): Promise<void> {
    console.log('❌ Payment failed:', {
      code: query.code,
      description: query.description,
      orderNumber: query.order
    });

    await this.updatePaymentStatus(
      query.order || '', 
      'failed', 
      undefined,
      undefined,
      undefined,
      query.code,
      query.description
    );

    // Configurar parámetros de redirección
    callbackUrl.searchParams.set('code', query.code || '0');
    callbackUrl.searchParams.set('order', query.order || '');
    callbackUrl.searchParams.set('description', query.description || 'Pago fallido');
  }

  private decodeReturnData(returnData: string): any {
    try {
      const decoded = Buffer.from(returnData, 'base64').toString();
      const parsedData = JSON.parse(decoded);
      console.log('📦 Decoded brand data:', parsedData.brandData);
      return parsedData.brandData;
    } catch (error) {
      console.error('❌ Error decoding returnData:', error);
      return null;
    }
  }

  private redirectToErrorPage(res: Response, errorMessage: string): void {
    const callbackUrl = new URL(`${this.frontendUrl}/payment/callback`);
    callbackUrl.searchParams.set('code', '0');
    callbackUrl.searchParams.set('description', errorMessage);
    res.redirect(callbackUrl.toString());
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
        await this.processSuccessfulPayment(
          orderNumber, 
          tilopayTransactionId || '', 
          authCode || '', 
          brandData
        );
      } else if (status === 'failed') {
        console.log(`❌ Payment failed for order ${orderNumber}: ${errorCode} - ${errorDescription}`);
      }

    } catch (error) {
      console.error('💥 Error updating payment status:', error);
    }
  }

  private async processSuccessfulPayment(
    orderNumber: string,
    tilopayTransactionId: string,
    authCode: string,
    brandData: any
  ): Promise<void> {
    console.log('✅ Processing successful payment...');
    
    const brand = await this.findBrandByEmail(brandData.email);

    if (brand && brand.brandPlans.length > 0) {
      const brandPlan = brand.brandPlans[0];
      
      console.log(`📋 Brand found: ${brand.name} (ID: ${brand.id})`);
      console.log(`📋 BrandPlan found: ${brandPlan.plan.name} (ID: ${brandPlan.id})`);
      
      // Crear registro de pago
      const payment = await this.createPaymentRecord(
        brand.id,
        brandPlan.id,
        brandData,
        orderNumber,
        tilopayTransactionId,
        authCode
      );

      console.log(`✅ Payment record created with ID: ${payment.id}`);
      
      // Actualizar el brandPlan
      await this.updateBrandPlanEndDate(brandPlan.id);
      console.log('✅ BrandPlan updated with new end date');
      
    } else {
      this.logBrandNotFoundError(brand, brandData.email);
    }
  }

  private async findBrandByEmail(email: string) {
    return await this.prisma.brand.findFirst({
      where: {
        userBrands: {
          some: {
            user: { email }
          }
        }
      },
      include: {
        brandPlans: {
          where: { isActive: true },
          include: { plan: true }
        },
        userBrands: {
          include: { user: true }
        }
      }
    });
  }

  private async createPaymentRecord(
    brandId: number,
    brandPlanId: number,
    brandData: any,
    orderNumber: string,
    tilopayTransactionId: string,
    authCode: string
  ) {
    return await this.prisma.payment.create({
      data: {
        brandId,
        brandPlanId,
        amount: parseFloat(brandData.amount || '0'),
        currency: 'USD',
        status: 'completed',
        tilopayTransactionId,
        tilopayReference: orderNumber,
        processedAt: new Date(),
        metadata: {
          authCode,
          description: 'Pago completado via Tilopay',
          brandData,
          orderNumber,
          tilopayTransactionId
        }
      }
    });
  }

  private async updateBrandPlanEndDate(brandPlanId: number): Promise<void> {
    await this.prisma.brandPlan.update({
      where: { id: brandPlanId },
      data: {
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días desde ahora
      }
    });
  }

  private logBrandNotFoundError(brand: any, email: string): void {
    if (!brand) {
      console.error('❌ No brand found for email:', email);
    } else if (brand.brandPlans.length === 0) {
      console.error('❌ No active brandPlans found for brand:', brand.id);
    }
  }

  async getAuthToken(): Promise<string> {
    try {
      const loginData: TilopayLoginRequest = {
        apiuser: this.apiUser,
        password: this.apiPassword,
      };

      const response: AxiosResponse<TilopayLoginResponse> = await firstValueFrom(
        this.httpService.post<TilopayLoginResponse>(
          `${this.baseUrl}/login`,
          loginData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.access_token;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo token de Tilopay',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async processPayment(paymentData: TilopayPaymentRequest): Promise<TilopayPaymentResponse> {
    try {
      const token = await this.getAuthToken();

      // Validar datos requeridos
      if (!paymentData.amount || !paymentData.currency || !paymentData.orderNumber) {
        throw new HttpException(
          'Datos de pago incompletos',
          HttpStatus.BAD_REQUEST
        );
      }

      const response: AxiosResponse<TilopayPaymentResponse> = await firstValueFrom(
        this.httpService.post<TilopayPaymentResponse>(
          `${this.baseUrl}/processPayment`,
          {
            ...paymentData,
            key: this.apiKey,
            platform: 'api',
            subscription: '0',
            capture: '1',
            hashVersion: 'V2'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 segundos de timeout
          },
        ),
      );

      if (!response.data.url) {
        throw new HttpException(
          'No se recibió URL de pago de Tilopay',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error procesando pago con Tilopay:', error);

      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'Error procesando pago con Tilopay',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      throw new HttpException(
        'Error de conexión con Tilopay',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
// backend/src/payment/payment-processing/payment-processing.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { PaymentStatus, PlanType } from '../../../generated/prisma';

interface TilopayTransaction {
  id: number;
  orderNumber: string;
  amount: string;
  currency: string;
  code: string;
  response: string;
  auth: string;
  card: string;
  last: string;
  email: string;
  capture: string;
  type: string;
  environment: string;
  date: string;
}

interface BrandData {
  email: string;
  name: string;
  phone?: string;
  ownerName?: string;
  location?: string;
  planType?: string;
  billingCycle?: string;
  selectedServices?: string[];
  [key: string]: any; // Para metadata JSON
}

@Injectable()
export class PaymentProcessingService {
  private baseUrl: string;
  private apiKey: string;
  private apiUser: string;
  private apiPassword: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('TILOPAY_BASE_URL') || '';
    this.apiKey = this.configService.get<string>('TILOPAY_API_KEY') || '';
    this.apiUser = this.configService.get<string>('TILOPAY_API_USER') || '';
    this.apiPassword = this.configService.get<string>('TILOPAY_API_PASSWORD') || '';
  }

  async verifyAndSavePayment(orderNumber: string, returnData?: string) {
    console.log('🔍 Verificando pago con Tilopay:', orderNumber);

    // 1. Consultar transacción en Tilopay
    const transaction = await this.consultTilopayTransaction(orderNumber);

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada en Tilopay');
    }

    console.log('✅ Transacción encontrada:', transaction);

    // 2. Verificar si el pago ya existe en nuestra DB
    const existingPayment = await this.prisma.payment.findFirst({
      where: { tilopayReference: orderNumber }
    });

    if (existingPayment) {
      console.log('⚠️ Pago ya existe en DB:', existingPayment.id);
      return this.getPaymentStatus(existingPayment.id);
    }

    // 3. Solo guardar si fue aprobada (code === "1")
    if (transaction.code !== '1') {
      console.log('❌ Transacción no aprobada, no se guarda');
      return {
        saved: false,
        message: 'Transacción no aprobada',
        transaction
      };
    }

    // 4. Decodificar brandData del returnData
    let brandData: BrandData | null = null;

    if (returnData) {
      try {
        const decoded = Buffer.from(decodeURIComponent(returnData), 'base64').toString();
        const parsed = JSON.parse(decoded);
        brandData = parsed.brandData || parsed;
        console.log('📦 Brand data decodificado:', brandData);
      } catch (error) {
        console.error('❌ Error decodificando returnData:', error);
      }
    }

    // Si no hay returnData, usar el email de la transacción de Tilopay
    if (!brandData || !brandData.email) {
      console.log('⚠️ No hay returnData, usando email de transacción Tilopay');
      brandData = {
        email: transaction.email,
        name: '', // Se obtendrá del brand
        planType: 'app', // Por defecto
        billingCycle: 'monthly' // Por defecto
      };
    }

    if (!brandData.email) {
      throw new NotFoundException('No se pudo obtener email del brand');
    }

    // 5. Buscar el brand y crear plan si no existe
    let brand = await this.findBrandByEmail(brandData.email);

    if (!brand) {
      throw new NotFoundException(`Brand no encontrado con email: ${brandData.email}`);
    }

    console.log('🏢 Brand encontrado:', { id: brand.id, name: brand.name, plansCount: brand.brandPlans.length });

    // Si el brand no tiene planes activos, crear uno
    let brandPlanId: number;

    if (!brand.brandPlans || brand.brandPlans.length === 0) {
      console.log('🆕 Creando nuevo BrandPlan...');

      // Buscar el plan según el tipo
      const planTypeInput = brandData.planType?.toLowerCase() || 'app';
      let normalizedPlanType: PlanType;

      if (planTypeInput === 'completo' || planTypeInput === 'complete') {
        normalizedPlanType = PlanType.complete;
      } else if (planTypeInput === 'web') {
        normalizedPlanType = PlanType.web;
      } else {
        normalizedPlanType = PlanType.app;
      }

      const plan = await this.prisma.plan.findFirst({
        where: { type: normalizedPlanType }
      });

      if (!plan) {
        throw new NotFoundException(`Plan no encontrado: ${normalizedPlanType}`);
      }

      // Crear brandPlan
      const billingPeriod = brandData.billingCycle === 'annual' ? 'annual' : 'monthly';
      const daysToAdd = billingPeriod === 'annual' ? 365 : 30;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysToAdd);

      const newBrandPlan = await this.prisma.brandPlan.create({
        data: {
          brandId: brand.id,
          planId: plan.id,
          billingPeriod,
          startDate: new Date(),
          endDate,
          isActive: true,
          price: parseFloat(transaction.amount)
        },
        include: { plan: true }
      });

      brandPlanId = newBrandPlan.id;
      console.log('✅ BrandPlan creado:', { id: brandPlanId, plan: plan.type, endDate });
    } else {
      brandPlanId = brand.brandPlans[0].id;
      console.log('✅ Usando BrandPlan existente:', brandPlanId);
    }

    // 6. Crear el pago en DB
    const payment = await this.createPaymentRecord(
      brand.id,
      brandPlanId,
      transaction,
      brandData
    );

    // 7. Extender el brandPlan
    await this.extendBrandPlanEndDate(brandPlanId);

    console.log('✅ Pago guardado exitosamente:', payment.id);

    return this.getPaymentStatus(payment.id);
  }

  private async consultTilopayTransaction(orderNumber: string): Promise<TilopayTransaction | null> {
    try {
      // Obtener token
      const token = await this.getAuthToken();

      // Consultar últimas 7 días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://app.tilopay.com/api/v1/consultTransactions',
          {
            key: this.apiKey,
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
            onlyAproved: 0,
            orderNumber: orderNumber
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      const transactions = response.data.response;

      if (!transactions || transactions.length === 0) {
        return null;
      }

      return transactions[0];
    } catch (error) {
      console.error('Error consultando Tilopay:', error);
      throw new Error('Error consultando transacción en Tilopay');
    }
  }

  private async createPaymentRecord(
    brandId: number,
    brandPlanId: number,
    transaction: TilopayTransaction,
    brandData: BrandData
  ) {
    return await this.prisma.payment.create({
      data: {
        brandId,
        brandPlanId,
        amount: parseFloat(transaction.amount),
        currency: transaction.currency,
        status: PaymentStatus.completed,
        tilopayTransactionId: transaction.id.toString(),
        tilopayReference: transaction.orderNumber,
        processedAt: new Date(transaction.date),
        metadata: {
          authCode: transaction.auth,
          cardLast4: transaction.last,
          cardType: transaction.card,
          tilopayResponse: transaction.response,
          brandData: brandData,
          transactionType: transaction.type,
          environment: transaction.environment
        } as any
      }
    });
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
        }
      }
    });
  }

  private async extendBrandPlanEndDate(brandPlanId: number): Promise<void> {
    const brandPlan = await this.prisma.brandPlan.findUnique({
      where: { id: brandPlanId }
    });

    if (!brandPlan) return;

    const daysToAdd = brandPlan.billingPeriod === 'annual' ? 365 : 30;
    const currentEndDate = brandPlan.endDate || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    await this.prisma.brandPlan.update({
      where: { id: brandPlanId },
      data: {
        endDate: newEndDate,
        isActive: true
      }
    });

    console.log('✅ BrandPlan extendido hasta:', newEndDate);
  }

  async getPaymentStatus(paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        brandPlan: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      tilopayTransactionId: payment.tilopayTransactionId,
      tilopayReference: payment.tilopayReference,
      processedAt: payment.processedAt,
      createdAt: payment.createdAt,
      brand: payment.brand,
      plan: payment.brandPlan?.plan || null,
      metadata: payment.metadata
    };
  }

  async getPaymentByOrderNumber(orderNumber: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { tilopayReference: orderNumber },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        brandPlan: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      tilopayTransactionId: payment.tilopayTransactionId,
      tilopayReference: payment.tilopayReference,
      processedAt: payment.processedAt,
      createdAt: payment.createdAt,
      brand: payment.brand,
      plan: payment.brandPlan?.plan || null,
      metadata: payment.metadata
    };
  }

  private async getAuthToken(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/login`,
          {
            apiuser: this.apiUser,
            password: this.apiPassword
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Error obteniendo token de Tilopay');
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
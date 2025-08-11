import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '../../../generated/prisma';

export interface TiloPayPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  redirectUrl: string;
  cancelUrl: string;
  metadata?: any;
}

export interface TiloPayPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

export interface PaymentProcessResult {
  success: boolean;
  paymentId?: number;
  tilopayTransactionId?: string;
  paymentUrl?: string;
  error?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly tilopayApiUrl: string;
  private readonly tilopayApiKey: string;
  private readonly baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.tilopayApiUrl = this.configService.get('TILOPAY_API_URL', 'https://api.tilopay.com');
    this.tilopayApiKey = this.configService.get('TILOPAY_API_KEY', '');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
  }

  /**
   * Procesa pago para un plan de marca
   */
  async processPaymentForPlan(
    brandId: number,
    brandPlanId: number,
    amount: number,
    metadata?: any
  ): Promise<PaymentProcessResult> {
    try {
      // Crear registro de pago en BD
      const payment = await this.prisma.payment.create({
        data: {
          brandId,
          brandPlanId,
          amount,
          currency: 'CRC',
          status: 'pending', // PaymentStatus.pending
          metadata
        }
      });

      // Si el monto es 0 (plan web), marcar como completado automáticamente
      if (amount === 0) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed', // PaymentStatus.completed
            processedAt: new Date()
          }
        });

        this.logger.log(`Payment auto-completed for free plan: Payment ID ${payment.id}`);
        return {
          success: true,
          paymentId: payment.id
        };
      }

      // Procesar pago con TiloPay
      const tilopayResult = await this.createTiloPayPayment({
        amount,
        currency: 'CRC',
        description: `Suscripción plan - Marca ${brandId}`,
        reference: `BRAND_${brandId}_PLAN_${brandPlanId}_${Date.now()}`,
        redirectUrl: `${this.baseUrl}/payment/success?paymentId=${payment.id}`,
        cancelUrl: `${this.baseUrl}/payment/cancel?paymentId=${payment.id}`,
        metadata: { brandId, brandPlanId, paymentId: payment.id }
      });

      if (tilopayResult.success) {
        // Actualizar pago con datos de TiloPay
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'processing', // PaymentStatus.processing
            tilopayTransactionId: tilopayResult.transactionId,
            tilopayReference: tilopayResult.reference,
            paymentMethod: 'tilopay'
          }
        });

        return {
          success: true,
          paymentId: payment.id,
          tilopayTransactionId: tilopayResult.transactionId,
          paymentUrl: tilopayResult.paymentUrl
        };
      } else {
        // Marcar pago como fallido
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'failed', // PaymentStatus.failed
            failureReason: tilopayResult.error
          }
        });

        return {
          success: false,
          error: tilopayResult.error
        };
      }
    } catch (error) {
      this.logger.error('Error processing payment', error);
      return {
        success: false,
        error: 'Error processing payment'
      };
    }
  }

  /**
   * Webhook para recibir confirmación de pago de TiloPay
   */
  async handlePaymentWebhook(payload: any): Promise<void> {
    try {
      const { transactionId, status, reference } = payload;

      // Buscar pago por transaction ID
      const payment = await this.prisma.payment.findUnique({
        where: { tilopayTransactionId: transactionId }
      });

      if (!payment) {
        this.logger.warn(`Payment not found for transaction ID: ${transactionId}`);
        return;
      }

      // Actualizar estado según respuesta de TiloPay
      let paymentStatus: string;
      let processedAt: Date | undefined;

      switch (status) {
        case 'approved':
        case 'completed':
          paymentStatus = 'completed';
          processedAt = new Date();
          break;
        case 'rejected':
        case 'failed':
          paymentStatus = 'failed';
          break;
        case 'cancelled':
          paymentStatus = 'cancelled';
          break;
        default:
          paymentStatus = 'processing';
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus as PaymentStatus,
          processedAt,
          metadata: {
            ...(payment.metadata as Record<string, any> || {}),
            tilopayWebhook: payload
          }
        }
      });

      this.logger.log(`Payment ${payment.id} updated to status: ${paymentStatus}`);
    } catch (error) {
      this.logger.error('Error handling payment webhook', error);
    }
  }

  /**
   * Crear pago en TiloPay
   */
  private async createTiloPayPayment(request: TiloPayPaymentRequest): Promise<TiloPayPaymentResponse> {
    try {
      // Si no hay API key configurada, simular éxito para desarrollo
      if (!this.tilopayApiKey) {
        this.logger.warn('TiloPay API key not configured, simulating payment');
        return {
          success: true,
          transactionId: `SIM_${Date.now()}`,
          paymentUrl: `${this.baseUrl}/payment/simulate?amount=${request.amount}`,
          reference: request.reference
        };
      }

      const response = await fetch(`${this.tilopayApiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tilopayApiKey}`
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          transactionId: data.transactionId,
          paymentUrl: data.paymentUrl,
          reference: data.reference
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'TiloPay API error'
        };
      }
    } catch (error) {
      this.logger.error('Error calling TiloPay API', error);
      return {
        success: false,
        error: 'TiloPay service unavailable'
      };
    }
  }

  /**
   * Obtener estado de un pago
   */
  async getPaymentStatus(paymentId: number) {
    return await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        brand: true,
        brandPlan: {
          include: {
            plan: true
          }
        }
      }
    });
  }

  /**
   * Verificar si una marca tiene pagos pendientes
   */
  async hasPendingPayments(brandId: number): Promise<boolean> {
    const pendingPayments = await this.prisma.payment.count({
      where: {
        brandId,
        status: {
          in: ['pending', 'processing']
        }
      }
    });

    return pendingPayments > 0;
  }
}

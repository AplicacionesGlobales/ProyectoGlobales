// backend/src/payment/payment-processing/payment-processing.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentWebhookDto, WebhookEventType } from './dto/payment-webhook.dto';
import { Prisma } from '@prisma/client';
import { PaymentStatus } from '../../../generated/prisma';

@Injectable()
export class PaymentProcessingService {
  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(webhookData: PaymentWebhookDto) {
    console.log('🔔 Processing webhook:', webhookData);

    // Buscar el pago por orderNumber o transactionId
    const payment = await this.findPaymentByReference(
      webhookData.orderNumber,
      webhookData.transactionId
    );

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Evitar procesar el mismo evento múltiples veces
    if (payment.status === 'completed' && webhookData.event === WebhookEventType.PAYMENT_COMPLETED) {
      console.log('⚠️ Payment already processed');
      return { message: 'Webhook ya procesado', paymentId: payment.id };
    }

    // Actualizar el estado del pago según el evento
    const updatedPayment = await this.updatePaymentFromWebhook(payment.id, webhookData);

    // Si es pago completado, actualizar el brandPlan
    if (webhookData.event === WebhookEventType.PAYMENT_COMPLETED && payment.brandPlanId) {
      await this.extendBrandPlanEndDate(payment.brandPlanId);
    }

    return {
      message: 'Webhook procesado exitosamente',
      paymentId: updatedPayment.id,
      status: updatedPayment.status
    };
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

  async getPaymentStatusByOrderNumber(orderNumber: string) {
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

  private async findPaymentByReference(orderNumber: string, transactionId: string) {
    return await this.prisma.payment.findFirst({
      where: {
        OR: [
          { tilopayReference: orderNumber },
          { tilopayTransactionId: transactionId }
        ]
      }
    });
  }

  private async updatePaymentFromWebhook(paymentId: number, webhookData: PaymentWebhookDto) {
    const statusMap: Record<WebhookEventType, PaymentStatus> = {
      [WebhookEventType.PAYMENT_COMPLETED]: PaymentStatus.completed,
      [WebhookEventType.PAYMENT_FAILED]: PaymentStatus.failed,
      [WebhookEventType.PAYMENT_REFUNDED]: PaymentStatus.cancelled
    };

    return await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: statusMap[webhookData.event],
        tilopayTransactionId: webhookData.transactionId,
        processedAt: webhookData.processedAt ? new Date(webhookData.processedAt) : new Date(),
        metadata: {
          ...(typeof this.prisma.payment.findUnique === 'function' 
            ? {} 
            : {}),
          webhookEvent: webhookData.event,
          authCode: webhookData.authCode,
          webhookMetadata: webhookData.metadata,
          updatedAt: new Date().toISOString()
        }
      }
    });
  }

  private async extendBrandPlanEndDate(brandPlanId: number): Promise<void> {
    const brandPlan = await this.prisma.brandPlan.findUnique({
      where: { id: brandPlanId }
    });

    if (!brandPlan) {
      console.error('❌ BrandPlan not found:', brandPlanId);
      return;
    }

    // Extender 30 días desde la fecha actual de expiración o desde ahora
    const currentEndDate = brandPlan.endDate || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.brandPlan.update({
      where: { id: brandPlanId },
      data: {
        endDate: newEndDate,
        isActive: true
      }
    });

    console.log('✅ BrandPlan extended to:', newEndDate);
  }
}
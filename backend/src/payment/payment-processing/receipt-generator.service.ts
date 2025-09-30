// backend/src/payment/payment-processing/receipt-generator.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument = require('pdfkit');

@Injectable()
export class ReceiptGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(paymentId: number): Promise<{ buffer: Buffer; filename: string }> {
    // Obtener información del pago
    const payment = await this.getPaymentDetails(paymentId);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== 'completed') {
      throw new NotFoundException('El pago no está completado');
    }

    // Generar PDF
    const pdfBuffer = await this.createPDF(payment);
    const filename = `receipt-${payment.tilopayReference || payment.id}.pdf`;

    console.log('✅ Receipt generated:', filename);

    return { buffer: pdfBuffer, filename };
  }

  private async getPaymentDetails(paymentId: number) {
    return await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        brandPlan: {
          include: {
            plan: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
  }

  private async createPDF(payment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('RECIBO DE PAGO', { align: 'center' });
      doc.moveDown();

      // Info del Brand
      doc.fontSize(12).text(`Empresa: ${payment.brand.name}`);
      if (payment.brand.address) {
        doc.text(`Dirección: ${payment.brand.address}`);
      }
      if (payment.brand.phone) {
        doc.text(`Teléfono: ${payment.brand.phone}`);
      }
      doc.text(`Email: ${payment.brand.owner.email}`);
      doc.moveDown();

      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Detalles del pago
      doc.fontSize(14).text('Detalles del Pago', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(11);
      doc.text(`Recibo #: ${payment.tilopayReference || payment.id}`);
      doc.text(`Fecha: ${payment.processedAt ? new Date(payment.processedAt).toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'}`);
      doc.text(`Estado: ${this.getStatusText(payment.status)}`);
      doc.text(`ID Transacción: ${payment.tilopayTransactionId || 'N/A'}`);
      doc.moveDown();

      // Información del plan (solo si existe)
      if (payment.brandPlan && payment.brandPlan.plan) {
        doc.fontSize(14).text('Plan Contratado', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(11);
        doc.text(`Plan: ${payment.brandPlan.plan.name}`);
        if (payment.brandPlan.plan.description) {
          doc.text(`Descripción: ${payment.brandPlan.plan.description}`);
        }
        doc.text(`Período: ${this.getBillingPeriodText(payment.brandPlan.billingPeriod)}`);
        doc.moveDown();
      }

      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Total
      doc.fontSize(16);
      doc.text(`Monto Total: ${payment.currency} $${payment.amount}`, { align: 'right' });
      doc.moveDown(2);

      // Footer
      doc.fontSize(10);
      doc.text('Gracias por su pago', { align: 'center' });
      doc.text('Este es un recibo generado automáticamente', { align: 'center' });

      doc.end();
    });
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      processing: 'Procesando'
    };
    return statusMap[status] || status;
  }

  private getBillingPeriodText(period: string): string {
    const periodMap: Record<string, string> = {
      monthly: 'Mensual',
      annual: 'Anual'
    };
    return periodMap[period] || period;
  }
}
// backend/src/payment/payment-processing/receipt-generator.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument = require('pdfkit');

@Injectable()
export class ReceiptGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(paymentId: number): Promise<{ buffer: Buffer; filename: string }> {
    const payment = await this.getPaymentDetails(paymentId);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== 'completed') {
      throw new NotFoundException('El pago no está completado');
    }

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

      // ========================================
      // HEADER - White Label (Tu empresa)
      // ========================================
      doc.fontSize(24).font('Helvetica-Bold').text('WHITE LABEL', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Plataforma de Gestión Empresarial', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).text('www.whitelabel.com | soporte@whitelabel.com', { align: 'center' });
      doc.moveDown(1.5);

      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ========================================
      // TÍTULO
      // ========================================
      doc.fontSize(18).font('Helvetica-Bold').text('RECIBO DE PAGO', { align: 'center' });
      doc.moveDown(1);

      // ========================================
      // INFORMACIÓN DEL CLIENTE
      // ========================================
      doc.fontSize(12).font('Helvetica-Bold').text('Cliente:', { continued: false });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Empresa: ${payment.brand.name}`);
      if (payment.brand.address) {
        doc.text(`Dirección: ${payment.brand.address}`);
      }
      if (payment.brand.phone) {
        doc.text(`Teléfono: ${payment.brand.phone}`);
      }
      doc.text(`Email: ${payment.brand.owner.email}`);
      doc.text(`Contacto: ${payment.brand.owner.firstName} ${payment.brand.owner.lastName}`);
      doc.moveDown(1);

      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ========================================
      // DETALLES DEL PAGO
      // ========================================
      doc.fontSize(12).font('Helvetica-Bold').text('Detalles de la Transacción', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(10).font('Helvetica');
      
      // Tabla de detalles
      const leftColumn = 80;
      const rightColumn = 300;
      let currentY = doc.y;

      // Recibo #
      doc.text('Recibo #:', leftColumn, currentY, { continued: false });
      doc.text(payment.tilopayReference || payment.id, rightColumn, currentY);
      currentY += 20;

      // Fecha
      doc.text('Fecha de Pago:', leftColumn, currentY);
      doc.text(
        payment.processedAt 
          ? new Date(payment.processedAt).toLocaleDateString('es-CR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A',
        rightColumn,
        currentY
      );
      currentY += 20;

      // Estado
      doc.text('Estado:', leftColumn, currentY);
      doc.text(this.getStatusText(payment.status), rightColumn, currentY);
      currentY += 20;

      // ID Transacción
      doc.text('ID Transacción:', leftColumn, currentY);
      doc.text(payment.tilopayTransactionId || 'N/A', rightColumn, currentY);
      currentY += 20;

      // Método de pago
      doc.text('Método de Pago:', leftColumn, currentY);
      doc.text('Tarjeta de crédito/débito', rightColumn, currentY);
      currentY += 30;

      doc.y = currentY;

      // ========================================
      // INFORMACIÓN DEL PLAN (si existe)
      // ========================================
      if (payment.brandPlan && payment.brandPlan.plan) {
        doc.fontSize(12).font('Helvetica-Bold').text('Plan Contratado', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10).font('Helvetica');
        currentY = doc.y;

        doc.text('Plan:', leftColumn, currentY);
        doc.text(payment.brandPlan.plan.name, rightColumn, currentY);
        currentY += 20;

        if (payment.brandPlan.plan.description) {
          doc.text('Descripción:', leftColumn, currentY);
          doc.text(payment.brandPlan.plan.description, rightColumn, currentY, { width: 250 });
          currentY += 30;
        }

        doc.text('Período:', leftColumn, currentY);
        doc.text(this.getBillingPeriodText(payment.brandPlan.billingPeriod), rightColumn, currentY);
        currentY += 30;

        doc.y = currentY;
      }

      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ========================================
      // TOTAL
      // ========================================
      doc.fontSize(14).font('Helvetica-Bold');
      const totalY = doc.y;
      doc.text('MONTO TOTAL:', leftColumn, totalY);
      doc.fontSize(18);
      doc.text(`${payment.currency} $${payment.amount}`, rightColumn, totalY);
      doc.moveDown(2);

      // ========================================
      // FOOTER
      // ========================================
      doc.fontSize(9).font('Helvetica');
      doc.text('Gracias por confiar en White Label', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor('#666666');
      doc.text('Este es un recibo generado automáticamente', { align: 'center' });
      doc.text('Para cualquier consulta, contacte a soporte@whitelabel.com', { align: 'center' });

      doc.end();
    });
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'completed': 'Completado',
      'pending': 'Pendiente',
      'failed': 'Fallido',
      'cancelled': 'Cancelado',
      'processing': 'Procesando'
    };
    return statusMap[status] || status;
  }

  private getBillingPeriodText(period: string): string {
    return period === 'annual' ? 'Anual' : 'Mensual';
  }
}
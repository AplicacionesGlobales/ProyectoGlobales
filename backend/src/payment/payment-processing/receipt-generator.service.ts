// backend/src/payment/payment-processing/receipt-generator.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(
    paymentId: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
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
                email: true,
              },
            },
          },
        },
        brandPlan: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                type: true,
                description: true,
                basePrice: true,
              },
            },
          },
        },
      },
    });
  }

  private async createPDF(payment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 45,
        size: 'LETTER',
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ========================================
      // HEADER - White Label
      // ========================================
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('WHITE LABEL', { align: 'center' });
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Sistema de Gestión Empresarial', { align: 'center' });
      doc.moveDown(0.2);
      doc
        .fontSize(8)
        .fillColor('#666666')
        .text('www.whitelabel.com', { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(1);

      // Línea divisoria
      doc.lineWidth(2).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.lineWidth(1);
      doc.moveDown(0.8);

      // ========================================
      // TÍTULO
      // ========================================
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('COMPROBANTE DE PAGO', { align: 'center' });
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Recibo No. ${payment.tilopayReference || payment.id}`, {
          align: 'center',
        });
      doc.fillColor('#000000');
      doc.moveDown(1);

      // ========================================
      // INFORMACIÓN DEL CLIENTE
      // ========================================
      const boxY = doc.y;
      const boxHeight = payment.brand.phone ? 75 : 65;

      doc.rect(45, boxY, 510, boxHeight).fillAndStroke('#f8f9fa', '#dee2e6');

      doc
        .fillColor('#000000')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('FACTURADO A:', 55, boxY + 8);

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${payment.brand.name}`, 55, boxY + 24)
        .text(
          `${payment.brand.owner.firstName} ${payment.brand.owner.lastName}`,
          55,
          boxY + 37,
        )
        .text(`${payment.brand.owner.email}`, 55, boxY + 50);

      if (payment.brand.phone) {
        doc.text(`Tel: ${payment.brand.phone}`, 55, boxY + 63);
      }

      doc.y = boxY + boxHeight + 15;

      // ========================================
      // TABLA DE DETALLES
      // ========================================
      const tableTop = doc.y;
      const col1X = 55;
      const col2X = 340;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('DETALLES DE LA TRANSACCIÓN', col1X, tableTop);

      doc.moveDown(0.4);
      doc.moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      let currentY = doc.y;

      const addRow = (label: string, value: string, bold = false) => {
        doc.fontSize(9).font('Helvetica').text(label, col1X, currentY);
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(value, col2X, currentY);
        currentY += 16;
      };

      // Fecha y hora
      addRow(
        'Fecha de Pago:',
        payment.processedAt
          ? new Date(payment.processedAt).toLocaleDateString('es-CR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date(payment.createdAt).toLocaleDateString('es-CR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
      );

      addRow('Método de Pago:', 'Tarjeta de crédito/débito');

      if (payment.tilopayTransactionId) {
        addRow('ID Transacción:', payment.tilopayTransactionId);
      }

      if (payment.metadata?.authCode) {
        addRow('Código de Autorización:', payment.metadata.authCode);
      }

      currentY += 6;
      doc.moveTo(45, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      // ========================================
      // DETALLE DEL SERVICIO
      // ========================================
      doc.y = currentY;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('SERVICIO CONTRATADO', col1X);
      doc.moveDown(0.4);

      currentY = doc.y;

      if (payment.brandPlan && payment.brandPlan.plan) {
        addRow('Plan:', payment.brandPlan.plan.name, true);

        const planTypeText =
          {
            app: 'Aplicación Móvil',
            web: 'Sitio Web',
            complete: 'Paquete Completo',
          }[payment.brandPlan.plan.type] || payment.brandPlan.plan.type;

        addRow('Tipo:', planTypeText);

        const periodText =
          payment.brandPlan.billingPeriod === 'annual'
            ? 'Anual (12 meses)'
            : 'Mensual (1 mes)';
        addRow('Período:', periodText);

        if (payment.brandPlan.startDate && payment.brandPlan.endDate) {
          const startDate = new Date(
            payment.brandPlan.startDate,
          ).toLocaleDateString('es-CR');
          const endDate = new Date(
            payment.brandPlan.endDate,
          ).toLocaleDateString('es-CR');
          addRow('Vigencia:', `${startDate} - ${endDate}`);
        }
      } else {
        addRow(
          'Descripción:',
          payment.description || 'Servicio de suscripción',
        );
      }

      currentY += 6;

      // ========================================
      // RESUMEN DE COSTOS
      // ========================================
      doc.y = currentY;
      doc.moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      currentY = doc.y;

      if (payment.brandPlan?.plan?.basePrice) {
        const basePrice = Number(payment.brandPlan.plan.basePrice);
        doc.fontSize(9).font('Helvetica').text('Subtotal:', col1X, currentY);
        doc.text(
          `${payment.currency} $${basePrice.toFixed(2)}`,
          col2X,
          currentY,
        );
        currentY += 16;

        const totalAmount = Number(payment.amount);
        const additionalServices = totalAmount - basePrice;

        if (additionalServices > 0) {
          doc.text('Servicios Adicionales:', col1X, currentY);
          doc.text(
            `${payment.currency} $${additionalServices.toFixed(2)}`,
            col2X,
            currentY,
          );
          currentY += 16;
        }

        currentY += 4;
        doc.moveTo(col2X, currentY).lineTo(550, currentY).stroke();
        currentY += 8;
      }

      // TOTAL
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('TOTAL PAGADO:', col1X, currentY);
      doc
        .fontSize(15)
        .text(
          `${payment.currency} $${Number(payment.amount).toFixed(2)}`,
          col2X,
          currentY,
        );

      // ========================================
      // FOOTER - Ajustado para que no se pase
      // ========================================
      const pageHeight = 792;
      const footerStartY = pageHeight - 85; // Aumentado de 75 a 85

      doc.fontSize(7).fillColor('#666666').font('Helvetica');
      doc.text(
        'Este documento certifica el pago recibido por los servicios contratados.',
        45,
        footerStartY,
        { align: 'center', width: 510 },
      );

      doc.text(
        'Soporte: soporte@whitelabel.com | Tel: +506 2222-3333',
        45,
        footerStartY + 12,
        { align: 'center', width: 510 },
      );

      doc
        .fontSize(6)
        .text(
          `Generado el ${new Date().toLocaleDateString('es-CR')} ${new Date().toLocaleTimeString('es-CR')}`,
          45,
          footerStartY + 24,
          { align: 'center', width: 510 },
        );

      doc.end();
    });
  }
}

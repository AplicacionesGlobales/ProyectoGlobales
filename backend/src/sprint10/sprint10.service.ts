// src/sprint10/sprint10.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import {
  BillingCalculationRequestDto,
  BillingCalculationResponseDto,
  ManualRenewalRequestDto,
  ManualRenewalResponseDto,
  ProrationCalculationDto
} from './dto';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class Sprint10Service {
  constructor(private prisma: PrismaService) {}

  /**
   * Generar recibo en PDF para un payment específico (Pablo)
   */
  async generateReceiptPDF(paymentId: number): Promise<Buffer> {
    // Buscar el payment con toda la información necesaria
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            description: true,
            phone: true
          }
        },
        brandPlan: {
          include: {
            plan: {
              select: {
                name: true,
                basePrice: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return this.createPDFReceipt(payment);
  }

  /**
   * Crear el PDF del recibo con estilo profesional
   */
  private async createPDFReceipt(payment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 45,
        size: 'LETTER'
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ========================================
      // HEADER - White Label
      // ========================================
      doc.fontSize(24).font('Helvetica-Bold').text('WHITE LABEL', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Sistema de Gestión Empresarial', { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(8).fillColor('#666666').text('www.whitelabel.com', { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(1);

      // Línea divisoria
      doc.lineWidth(2).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.lineWidth(1);
      doc.moveDown(0.8);

      // ========================================
      // TÍTULO
      // ========================================
      doc.fontSize(18).font('Helvetica-Bold').text('COMPROBANTE DE PAGO', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text(`Recibo No. ${payment.tilopayReference || payment.id}`, { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(1);

      // ========================================
      // INFORMACIÓN DEL CLIENTE
      // ========================================
      const boxY = doc.y;
      const boxHeight = payment.brand.phone ? 75 : 65;

      doc.rect(45, boxY, 510, boxHeight).fillAndStroke('#f8f9fa', '#dee2e6');

      doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
        .text('FACTURADO A:', 55, boxY + 8);

      doc.fontSize(9).font('Helvetica')
        .text(`${payment.brand.name}`, 55, boxY + 24);
      
      if (payment.brand.description) {
        doc.text(`${payment.brand.description}`, 55, boxY + 37);
      }

      if (payment.brand.phone) {
        doc.text(`Tel: ${payment.brand.phone}`, 55, boxY + 50);
      }

      doc.y = boxY + boxHeight + 15;

      // ========================================
      // TABLA DE DETALLES
      // ========================================
      const tableTop = doc.y;
      const col1X = 55;
      const col2X = 340;

      doc.fontSize(10).font('Helvetica-Bold')
        .text('DETALLES DE LA TRANSACCIÓN', col1X, tableTop);

      doc.moveDown(0.4);
      doc.moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      let currentY = doc.y;

      const addRow = (label: string, value: string, bold = false) => {
        doc.fontSize(9).font('Helvetica').text(label, col1X, currentY);
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').text(value, col2X, currentY);
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
            minute: '2-digit'
          })
          : new Date(payment.createdAt).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
      );

      addRow('Método de Pago:', payment.paymentMethod || 'Tarjeta de crédito/débito');

      if (payment.tilopayTransactionId) {
        addRow('ID Transacción:', payment.tilopayTransactionId);
      }

      if (payment.tilopayReference) {
        addRow('Referencia:', payment.tilopayReference);
      }

      addRow('Estado:', payment.status.toUpperCase(), true);

      currentY += 6;
      doc.moveTo(45, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      // ========================================
      // DETALLE DEL SERVICIO
      // ========================================
      doc.y = currentY;
      doc.fontSize(10).font('Helvetica-Bold').text('SERVICIO CONTRATADO', col1X);
      doc.moveDown(0.4);

      currentY = doc.y;

      if (payment.brandPlan && payment.brandPlan.plan) {
        addRow('Plan:', payment.brandPlan.plan.name, true);

        const planTypeText = {
          'app': 'Aplicación Móvil',
          'web': 'Sitio Web',
          'complete': 'Paquete Completo'
        }[payment.brandPlan.plan.type] || payment.brandPlan.plan.type;

        addRow('Tipo:', planTypeText);
        addRow('Período:', 'Mensual (1 mes)');

        if (payment.brandPlan.startDate && payment.brandPlan.endDate) {
          const startDate = new Date(payment.brandPlan.startDate).toLocaleDateString('es-CR');
          const endDate = new Date(payment.brandPlan.endDate).toLocaleDateString('es-CR');
          addRow('Vigencia:', `${startDate} - ${endDate}`);
        }
      } else {
        addRow('Descripción:', payment.description || 'Servicio de suscripción');
        addRow('Tipo de Pago:', payment.paymentType);
      }

      currentY += 6;

      // ========================================
      // RESUMEN DE COSTOS
      // ========================================
      doc.y = currentY;
      doc.moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      currentY = doc.y;

      // TOTAL
      doc.fontSize(13).font('Helvetica-Bold')
        .text('TOTAL PAGADO:', col1X, currentY);
      doc.fontSize(15)
        .text(`${payment.currency} $${Number(payment.amount).toFixed(2)}`, col2X, currentY);

      // ========================================
      // FOOTER
      // ========================================
      const pageHeight = 792;
      const footerStartY = pageHeight - 85;

      doc.fontSize(7).fillColor('#666666').font('Helvetica');
      doc.text(
        'Este documento certifica el pago recibido por los servicios contratados.',
        45,
        footerStartY,
        { align: 'center', width: 510 }
      );

      doc.text(
        'Soporte: soporte@whitelabel.com | Tel: +506 2222-3333',
        45,
        footerStartY + 12,
        { align: 'center', width: 510 }
      );

      doc.fontSize(6).text(
        `Generado el ${new Date().toLocaleDateString('es-CR')} ${new Date().toLocaleTimeString('es-CR')} (Pablo)`,
        45,
        footerStartY + 24,
        { align: 'center', width: 510 }
      );

      doc.end();
    });
  }

  /**
   * Calcular prorateo por tiempo para facturación mensual (Pablo)
   */
  async calculateProration(
    request: BillingCalculationRequestDto
  ): Promise<BaseResponseDto<BillingCalculationResponseDto>> {
    try {
      // Validar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: request.brandId }
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${request.brandId} not found`);
      }

      // Obtener información del plan
      const plan = await this.prisma.plan.findUnique({
        where: { id: request.planId }
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${request.planId} not found`);
      }

      // Calcular prorateo
      const startDate = new Date(request.startDate);
      const endDate = request.endDate ? new Date(request.endDate) : this.getNextMonthDate(startDate);
      
      const prorationCalculation = this.calculateMonthlyProration(
        startDate,
        endDate,
        parseFloat(plan.basePrice.toString())
      );

      // Calcular próxima fecha de renovación (siempre mensual)
      const nextRenewalDate = this.getNextMonthDate(endDate);

      const response: BillingCalculationResponseDto = {
        brandId: request.brandId,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.basePrice.toString(),
          billingPeriod: 'monthly' // Por defecto mensual como especificaste
        },
        prorationCalculation,
        nextRenewalDate: nextRenewalDate.toISOString()
      };

      return BaseResponseDto.success(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Procesar renovación manual de suscripción (Pablo)
   */
  async processManualRenewal(
    request: ManualRenewalRequestDto
  ): Promise<BaseResponseDto<ManualRenewalResponseDto>> {
    try {
      // Validar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: request.brandId }
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${request.brandId} not found`);
      }

      // Obtener el plan actual (si existe)
      const currentBrandPlan = await this.prisma.brandPlan.findFirst({
        where: {
          brandId: request.brandId,
          planId: request.currentPlanId,
          isActive: true
        },
        include: {
          plan: true
        }
      });

      // Si no existe un plan activo, aún podemos proceder con la renovación
      // creando un nuevo brandPlan
      if (!currentBrandPlan) {
        console.log(`No active brand plan found for brandId: ${request.brandId}, planId: ${request.currentPlanId}. Creating new one.`);
      }

      // Determinar el plan para la renovación
      const targetPlanId = request.newPlanId || request.currentPlanId;
      const targetPlan = await this.prisma.plan.findUnique({
        where: { id: targetPlanId }
      });

      if (!targetPlan) {
        throw new NotFoundException(`Target plan with ID ${targetPlanId} not found`);
      }

      const renewalDate = new Date();
      const nextExpirationDate = this.getNextMonthDate(renewalDate);

      // Crear nueva entrada de brand plan para la renovación
      const newBrandPlan = await this.prisma.brandPlan.create({
        data: {
          brandId: request.brandId,
          planId: targetPlanId,
          price: targetPlan.basePrice,
          startDate: renewalDate,
          endDate: nextExpirationDate,
          isActive: true
        }
      });

      // Desactivar el plan anterior si existe y es diferente
      if (currentBrandPlan && currentBrandPlan.id !== newBrandPlan.id) {
        await this.prisma.brandPlan.update({
          where: { id: currentBrandPlan.id },
          data: { isActive: false }
        });
      }

      const response: ManualRenewalResponseDto = {
        newBrandPlanId: newBrandPlan.id,
        renewalDate: renewalDate.toISOString(),
        amount: targetPlan.basePrice.toString(),
        plan: {
          id: targetPlan.id,
          name: targetPlan.name,
          price: targetPlan.basePrice.toString(),
          billingPeriod: 'monthly' // Por defecto mensual como especificaste
        },
        nextExpirationDate: nextExpirationDate.toISOString()
      };

      return BaseResponseDto.success(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcular prorateo mensual basado en días utilizados
   */
  private calculateMonthlyProration(
    startDate: Date,
    endDate: Date,
    originalAmount: number
  ): ProrationCalculationDto {
    // Calcular días utilizados
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysUsed = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Obtener total de días del mes de inicio
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Calcular monto prorrateado
    const proratedAmount = (originalAmount * daysUsed) / totalDays;

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      daysUsed,
      totalDays,
      originalAmount: originalAmount.toFixed(2),
      proratedAmount: proratedAmount.toFixed(2)
    };
  }

  /**
   * Obtener la fecha del próximo mes
   */
  private getNextMonthDate(currentDate: Date): Date {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  }

  /**
   * Método de debug para ver datos de un brand (Pablo)
   */
  async debugBrandData(brandId: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        brandPlans: {
          include: {
            plan: true
          }
        },
        payments: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    // También obtener todos los planes disponibles
    const allPlans = await this.prisma.plan.findMany({
      where: { isActive: true }
    });

    return {
      brand: {
        id: brand.id,
        name: brand.name,
        description: brand.description
      },
      activeBrandPlans: brand.brandPlans.filter(bp => bp.isActive),
      allBrandPlans: brand.brandPlans,
      recentPayments: brand.payments,
      availablePlans: allPlans
    };
  }
}
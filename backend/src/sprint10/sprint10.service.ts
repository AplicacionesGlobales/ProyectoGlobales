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
   * Crear el PDF del recibo
   */
  private async createPDFReceipt(payment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      // Capturar los chunks del PDF
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header del recibo
      doc.fontSize(20).text('RECIBO DE PAGO', 50, 50);
      doc.fontSize(12).text(`Recibo #${payment.id}`, 50, 80);
      doc.text(`Fecha: ${new Date(payment.createdAt).toLocaleDateString('es-ES')}`, 50, 100);

      // Información del negocio/brand
      doc.fontSize(14).text('INFORMACIÓN DEL NEGOCIO', 50, 140);
      doc.fontSize(12);
      doc.text(`Nombre: ${payment.brand.name}`, 50, 160);
      if (payment.brand.description) {
        doc.text(`Descripción: ${payment.brand.description}`, 50, 180);
      }
      if (payment.brand.phone) {
        doc.text(`Teléfono: ${payment.brand.phone}`, 50, 200);
      }

      // Información del pago
      doc.fontSize(14).text('DETALLES DEL PAGO', 50, 240);
      doc.fontSize(12);
      doc.text(`Monto: ${payment.currency} ${payment.amount}`, 50, 260);
      doc.text(`Estado: ${payment.status.toUpperCase()}`, 50, 280);
      doc.text(`Tipo de pago: ${payment.paymentType}`, 50, 300);
      
      if (payment.paymentMethod) {
        doc.text(`Método de pago: ${payment.paymentMethod}`, 50, 320);
      }
      
      if (payment.tilopayReference) {
        doc.text(`Referencia Tilopay: ${payment.tilopayReference}`, 50, 340);
      }

      if (payment.tilopayTransactionId) {
        doc.text(`ID Transacción: ${payment.tilopayTransactionId}`, 50, 360);
      }

      // Información del plan (si existe)
      if (payment.brandPlan && payment.brandPlan.plan) {
        doc.fontSize(14).text('INFORMACIÓN DEL PLAN', 50, 400);
        doc.fontSize(12);
        doc.text(`Plan: ${payment.brandPlan.plan.name}`, 50, 420);
        doc.text(`Precio: ${payment.currency} ${payment.brandPlan.plan.basePrice}`, 50, 440);
        doc.text(`Período: mensual`, 50, 460);
      }

      // Fechas importantes
      doc.fontSize(14).text('FECHAS', 50, 500);
      doc.fontSize(12);
      doc.text(`Fecha de creación: ${new Date(payment.createdAt).toLocaleString('es-ES')}`, 50, 520);
      if (payment.processedAt) {
        doc.text(`Fecha de procesamiento: ${new Date(payment.processedAt).toLocaleString('es-ES')}`, 50, 540);
      }

      // Footer
      doc.fontSize(10).text('Este es un recibo generado automáticamente.', 50, 700);
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 50, 720);

      // Finalizar el documento
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
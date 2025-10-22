// src/sprint10/sprint10.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import {
  BillingCalculationRequestDto,
  BillingCalculationResponseDto,
  ManualRenewalRequestDto,
  ManualRenewalResponseDto,
  ProrationCalculationDto,
  SalesReportRequestDto,
  ReportPeriod,
} from './dto';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';

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
            phone: true,
          },
        },
        brandPlan: {
          include: {
            plan: {
              select: {
                name: true,
                basePrice: true,
              },
            },
          },
        },
      },
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

      addRow(
        'Método de Pago:',
        payment.paymentMethod || 'Tarjeta de crédito/débito',
      );

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
        addRow('Período:', 'Mensual (1 mes)');

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
      // FOOTER
      // ========================================
      const pageHeight = 792;
      const footerStartY = pageHeight - 85;

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
          `Generado el ${new Date().toLocaleDateString('es-CR')} ${new Date().toLocaleTimeString('es-CR')} (Pablo)`,
          45,
          footerStartY + 24,
          { align: 'center', width: 510 },
        );

      doc.end();
    });
  }

  /**
   * Calcular prorateo por tiempo para facturación mensual (Pablo)
   */
  async calculateProration(
    request: BillingCalculationRequestDto,
  ): Promise<BaseResponseDto<BillingCalculationResponseDto>> {
    try {
      // Validar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: request.brandId },
      });

      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${request.brandId} not found`,
        );
      }

      // Obtener información del plan
      const plan = await this.prisma.plan.findUnique({
        where: { id: request.planId },
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${request.planId} not found`);
      }

      // Calcular prorateo
      const startDate = new Date(request.startDate);
      const endDate = request.endDate
        ? new Date(request.endDate)
        : this.getNextMonthDate(startDate);

      const prorationCalculation = this.calculateMonthlyProration(
        startDate,
        endDate,
        parseFloat(plan.basePrice.toString()),
      );

      // Calcular próxima fecha de renovación (siempre mensual)
      const nextRenewalDate = this.getNextMonthDate(endDate);

      const response: BillingCalculationResponseDto = {
        brandId: request.brandId,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.basePrice.toString(),
          billingPeriod: 'monthly', // Por defecto mensual como especificaste
        },
        prorationCalculation,
        nextRenewalDate: nextRenewalDate.toISOString(),
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
    request: ManualRenewalRequestDto,
  ): Promise<BaseResponseDto<ManualRenewalResponseDto>> {
    try {
      // Validar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: request.brandId },
      });

      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${request.brandId} not found`,
        );
      }

      // Obtener el plan actual (si existe)
      const currentBrandPlan = await this.prisma.brandPlan.findFirst({
        where: {
          brandId: request.brandId,
          planId: request.currentPlanId,
          isActive: true,
        },
        include: {
          plan: true,
        },
      });

      // Si no existe un plan activo, aún podemos proceder con la renovación
      // creando un nuevo brandPlan
      if (!currentBrandPlan) {
        console.log(
          `No active brand plan found for brandId: ${request.brandId}, planId: ${request.currentPlanId}. Creating new one.`,
        );
      }

      // Determinar el plan para la renovación
      const targetPlanId = request.newPlanId || request.currentPlanId;
      const targetPlan = await this.prisma.plan.findUnique({
        where: { id: targetPlanId },
      });

      if (!targetPlan) {
        throw new NotFoundException(
          `Target plan with ID ${targetPlanId} not found`,
        );
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
          isActive: true,
        },
      });

      // Desactivar el plan anterior si existe y es diferente
      if (currentBrandPlan && currentBrandPlan.id !== newBrandPlan.id) {
        await this.prisma.brandPlan.update({
          where: { id: currentBrandPlan.id },
          data: { isActive: false },
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
          billingPeriod: 'monthly', // Por defecto mensual como especificaste
        },
        nextExpirationDate: nextExpirationDate.toISOString(),
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
    originalAmount: number,
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
      proratedAmount: proratedAmount.toFixed(2),
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
   * Cambiar plan de suscripción (Pablo)
   */
  async changePlan(
    brandId: number,
    newPlanId: number,
  ): Promise<BaseResponseDto<any>> {
    try {
      // Validar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${brandId} not found`);
      }

      // Validar que el nuevo plan existe
      const newPlan = await this.prisma.plan.findUnique({
        where: { id: newPlanId },
      });

      if (!newPlan) {
        throw new NotFoundException(`Plan with ID ${newPlanId} not found`);
      }

      // Desactivar todos los planes actuales del brand
      await this.prisma.brandPlan.updateMany({
        where: {
          brandId: brandId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Crear nuevo brand plan
      const currentDate = new Date();
      const nextExpirationDate = this.getNextMonthDate(currentDate);

      const newBrandPlan = await this.prisma.brandPlan.create({
        data: {
          brandId: brandId,
          planId: newPlanId,
          price: newPlan.basePrice,
          startDate: currentDate,
          endDate: nextExpirationDate,
          isActive: true,
        },
      });

      const response = {
        brandPlanId: newBrandPlan.id,
        plan: {
          id: newPlan.id,
          name: newPlan.name,
          type: newPlan.type,
          price: newPlan.basePrice.toString(),
        },
        startDate: currentDate.toISOString(),
        endDate: nextExpirationDate.toISOString(),
        message: `Plan cambiado exitosamente a ${newPlan.name}`,
      };

      return BaseResponseDto.success(response);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error cambiando plan: ${error.message}`);
    }
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
            plan: true,
          },
        },
        payments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    // También obtener todos los planes disponibles
    const allPlans = await this.prisma.plan.findMany({
      where: { isActive: true },
    });

    return {
      brand: {
        id: brand.id,
        name: brand.name,
        description: brand.description,
      },
      activeBrandPlans: brand.brandPlans.filter((bp) => bp.isActive),
      allBrandPlans: brand.brandPlans,
      recentPayments: brand.payments,
      availablePlans: allPlans,
    };
  }

  /**
   * Generar reporte de ventas en Excel para un brand específico (Kristel)
   */
  async generateSalesReport(request: SalesReportRequestDto): Promise<Buffer> {
    const { id_brand, period } = request;

    // Verificar que el brand existe
    const brand = await this.prisma.brand.findUnique({
      where: { id: id_brand },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id_brand} not found`);
    }

    // Calcular fechas según el período
    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case ReportPeriod.WEEKLY:
        // Últimos 7 días
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case ReportPeriod.MONTHLY:
        // Último mes (30 días)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case ReportPeriod.ALL:
        // Todo el histórico (no filtramos por fecha)
        startDate = undefined;
        break;
    }

    // Obtener las citas del brand en el período especificado
    const appointments = await this.prisma.appointment.findMany({
      where: {
        brandId: id_brand,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        serviceType: {
          select: {
            name: true,
            price: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Obtener los pagos del brand en el período especificado (datos secundarios)
    const payments = await this.prisma.payment.findMany({
      where: {
        brandId: id_brand,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      include: {
        brandPlan: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generar el archivo Excel
    return this.createExcelSalesReport(brand, appointments, payments, period);
  }

  /**
   * Generar reporte de ventas en formato JSON para un brand específico (Kristel)
   * A#: Crear endpoint POST /api/reports/sales para generar reportes
   */
  async generateSalesReportJson(
    request: SalesReportRequestDto,
  ): Promise<BaseResponseDto<any>> {
    const { id_brand, period } = request;

    // Verificar que el brand existe
    const brand = await this.prisma.brand.findUnique({
      where: { id: id_brand },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id_brand} not found`);
    }

    // Calcular fechas según el período
    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case ReportPeriod.WEEKLY:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case ReportPeriod.MONTHLY:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case ReportPeriod.ALL:
        startDate = undefined;
        break;
    }

    // Obtener las citas del brand en el período especificado
    const appointments = await this.prisma.appointment.findMany({
      where: {
        brandId: id_brand,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        serviceType: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Obtener los pagos del brand en el período especificado
    const payments = await this.prisma.payment.findMany({
      where: {
        brandId: id_brand,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      include: {
        brandPlan: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Procesar datos para el reporte JSON
    return this.createJsonSalesReport(brand, appointments, payments, period);
  }

  /**
   * Crear el reporte en formato JSON con las métricas
   */
  private createJsonSalesReport(
    brand: any,
    appointments: any[],
    payments: any[],
    period: ReportPeriod,
  ): BaseResponseDto<any> {
    // Etiquetas de estado
    const statusLabels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'No Asistió',
    };

    // Contar por estado y calcular ingresos de citas
    const statusCount = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };

    let totalAppointmentRevenue = 0;

    // Crear un mapa de pagos por tipo y entityId
    const paymentMap = new Map();
    payments.forEach((payment) => {
      if (payment.paymentType === 'APPOINTMENT' && payment.entityId) {
        paymentMap.set(payment.entityId, payment);
      }
    });

    // Procesar las citas
    const appointmentsData = appointments.map((appointment) => {
      const servicePrice =
        appointment.price || appointment.serviceType?.price || 0;
      const relatedPayment = paymentMap.get(appointment.id);

      // Contar por estado
      if (statusCount[appointment.status] !== undefined) {
        statusCount[appointment.status]++;
      }

      // Calcular ingresos de citas completadas
      if (appointment.status === 'COMPLETED') {
        totalAppointmentRevenue += parseFloat(servicePrice.toString());
      }

      return {
        id: appointment.id,
        fecha: appointment.startTime,
        cliente: {
          id: appointment.client?.id || null,
          nombre: appointment.client
            ? `${appointment.client.firstName} ${appointment.client.lastName || ''}`.trim()
            : 'Cliente No Registrado',
          email: appointment.client?.email || 'N/A',
          telefono: appointment.client?.phone || 'N/A',
        },
        servicio: {
          nombre: appointment.serviceType?.name || 'Sin Servicio',
          duracion: appointment.duration,
          precio: parseFloat(servicePrice.toString()),
        },
        estado: {
          codigo: appointment.status,
          etiqueta: statusLabels[appointment.status] || appointment.status,
        },
        pago: relatedPayment
          ? {
              monto: parseFloat(relatedPayment.amount.toString()),
              moneda: relatedPayment.currency,
              estado: relatedPayment.status,
              referencia: relatedPayment.tilopayReference || null,
            }
          : null,
        notas: appointment.notes || null,
        creadoPor: appointment.createdBy
          ? `${appointment.createdBy.firstName} ${appointment.createdBy.lastName || ''}`.trim()
          : null,
        fechaCreacion: appointment.createdAt,
      };
    });

    // Procesar pagos de suscripción
    const subscriptionPayments = payments.filter(
      (p) => p.paymentType === 'SUBSCRIPTION',
    );
    const completedPayments = subscriptionPayments.filter(
      (p) => p.status === 'completed',
    );
    const totalSubscriptionRevenue = completedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0,
    );

    // Calcular tasa de completitud
    const conversionRate =
      appointments.length > 0
        ? parseFloat(
            ((statusCount.COMPLETED / appointments.length) * 100).toFixed(2),
          )
        : 0;

    // Período en texto
    const periodText =
      period === ReportPeriod.WEEKLY
        ? 'Última Semana'
        : period === ReportPeriod.MONTHLY
          ? 'Último Mes'
          : 'Todo el Histórico';

    // Construir respuesta
    const reportData = {
      marca: {
        id: brand.id,
        nombre: brand.name,
        descripcion: brand.description,
      },
      periodo: {
        tipo: period,
        etiqueta: periodText,
      },
      fechaGeneracion: new Date().toISOString(),
      citas: {
        datos: appointmentsData,
        resumen: {
          total: appointments.length,
          porEstado: {
            completadas: statusCount.COMPLETED,
            confirmadas: statusCount.CONFIRMED,
            enProgreso: statusCount.IN_PROGRESS,
            pendientes: statusCount.PENDING,
            canceladas: statusCount.CANCELLED,
            noAsistieron: statusCount.NO_SHOW,
          },
          tasaCompletitud: conversionRate,
          ingresos: totalAppointmentRevenue,
        },
      },
      pagos: {
        suscripciones: {
          total: subscriptionPayments.length,
          completados: completedPayments.length,
          ingresos: totalSubscriptionRevenue,
        },
      },
      totales: {
        ingresosTotal: totalAppointmentRevenue + totalSubscriptionRevenue,
        ingresosCitas: totalAppointmentRevenue,
        ingresosSuscripciones: totalSubscriptionRevenue,
      },
    };

    return BaseResponseDto.success(reportData);
  }

  /**
   * Crear el archivo Excel con el reporte de ventas
   */
  private async createExcelSalesReport(
    brand: any,
    appointments: any[],
    payments: any[],
    period: ReportPeriod,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Citas y Ventas');

    // Configurar información del workbook
    workbook.creator = 'White Label System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ========================================
    // ENCABEZADO
    // ========================================
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DE CITAS Y VENTAS';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Información del Brand
    worksheet.mergeCells('A2:L2');
    const brandCell = worksheet.getCell('A2');
    brandCell.value = `Marca: ${brand.name}`;
    brandCell.font = { size: 12, bold: true };
    brandCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Período del reporte
    worksheet.mergeCells('A3:L3');
    const periodCell = worksheet.getCell('A3');
    const periodText =
      period === ReportPeriod.WEEKLY
        ? 'Última Semana'
        : period === ReportPeriod.MONTHLY
          ? 'Último Mes'
          : 'Todo el Histórico';
    periodCell.value = `Período: ${periodText}`;
    periodCell.font = { size: 11 };
    periodCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Fecha de generación
    worksheet.mergeCells('A4:L4');
    const dateCell = worksheet.getCell('A4');
    dateCell.value = `Fecha de Generación: ${new Date().toLocaleString('es-ES')}`;
    dateCell.font = { size: 10, italic: true };
    dateCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.addRow([]);

    // ========================================
    // CABECERAS DE TABLA - CITAS (Principal)
    // ========================================
    const headerRow = worksheet.addRow([
      'ID Cita',
      'Fecha Cita',
      'Cliente',
      'Email',
      'Teléfono',
      'Servicio',
      'Duración (min)',
      'Estado',
      'Precio Servicio',
      'Monto Pago',
      'Estado Pago',
      'Ref. TiloPay',
    ]);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E75B6' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // ========================================
    // DATOS DE CITAS
    // ========================================
    const statusCount = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };

    const statusLabels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'No Asistió',
    };

    let totalRevenue = 0;
    let completedAppointments = 0;

    // Crear un mapa de pagos por tipo y entityId para relacionarlos con citas
    const paymentMap = new Map();
    payments.forEach((payment) => {
      if (payment.paymentType === 'APPOINTMENT' && payment.entityId) {
        paymentMap.set(payment.entityId, payment);
      }
    });

    appointments.forEach((appointment) => {
      const clientName = appointment.client
        ? `${appointment.client.firstName} ${appointment.client.lastName || ''}`.trim()
        : 'Cliente No Registrado';

      const clientEmail = appointment.client?.email || 'N/A';
      const clientPhone = appointment.client?.phone || 'N/A';
      const serviceName = appointment.serviceType?.name || 'Sin Servicio';
      const servicePrice =
        appointment.price || appointment.serviceType?.price || 0;
      const statusLabel =
        statusLabels[appointment.status] || appointment.status;

      // Buscar pago relacionado
      const relatedPayment = paymentMap.get(appointment.id);

      const row = worksheet.addRow([
        appointment.id,
        new Date(appointment.startTime).toLocaleString('es-ES'),
        clientName,
        clientEmail,
        clientPhone,
        serviceName,
        appointment.duration,
        statusLabel,
        parseFloat(servicePrice.toString()),
        relatedPayment ? parseFloat(relatedPayment.amount.toString()) : 0,
        relatedPayment ? relatedPayment.status : 'N/A',
        relatedPayment?.tilopayReference || 'N/A',
      ]);

      // Formato de moneda para las columnas de precio
      row.getCell(9).numFmt = '₡#,##0.00';
      row.getCell(10).numFmt = '₡#,##0.00';

      // Color según el estado de la cita
      let statusColor = 'FFFFFFFF'; // Blanco por defecto
      switch (appointment.status) {
        case 'COMPLETED':
          statusColor = 'FFD4EDDA'; // Verde claro
          completedAppointments++;
          totalRevenue += parseFloat(servicePrice.toString());
          break;
        case 'CONFIRMED':
          statusColor = 'FFD1ECF1'; // Azul claro
          break;
        case 'IN_PROGRESS':
          statusColor = 'FFFFEAA7'; // Amarillo claro
          break;
        case 'CANCELLED':
          statusColor = 'FFF8D7DA'; // Rojo claro
          break;
        case 'NO_SHOW':
          statusColor = 'FFFFC9C9'; // Rojo más oscuro
          break;
        case 'PENDING':
          statusColor = 'FFFEF5E7'; // Naranja claro
          break;
      }

      // Aplicar color solo a las celdas con datos (columnas A-L)
      for (let col = 1; col <= 12; col++) {
        row.getCell(col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColor },
        };
      }

      // Contar por estado
      if (statusCount[appointment.status] !== undefined) {
        statusCount[appointment.status]++;
      }
    });

    // ========================================
    // RESUMEN DE CITAS
    // ========================================
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow(['RESUMEN DE CITAS']);
    worksheet.mergeCells(`A${summaryRow.number}:L${summaryRow.number}`);
    summaryRow.font = { size: 14, bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' },
    };

    worksheet.addRow(['Total de Citas:', appointments.length]);
    worksheet.addRow(['Citas Completadas:', statusCount.COMPLETED]);
    worksheet.addRow(['Citas Confirmadas:', statusCount.CONFIRMED]);
    worksheet.addRow(['Citas En Progreso:', statusCount.IN_PROGRESS]);
    worksheet.addRow(['Citas Pendientes:', statusCount.PENDING]);
    worksheet.addRow(['Citas Canceladas:', statusCount.CANCELLED]);
    worksheet.addRow(['Clientes No Presentados:', statusCount.NO_SHOW]);

    const revenueRow = worksheet.addRow([
      'INGRESOS POR CITAS COMPLETADAS:',
      totalRevenue,
    ]);
    revenueRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    revenueRow.getCell(2).numFmt = '₡#,##0.00';
    // Aplicar color solo a las primeras 2 columnas
    revenueRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    revenueRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };

    // Tasa de conversión
    const conversionRate =
      appointments.length > 0
        ? ((statusCount.COMPLETED / appointments.length) * 100).toFixed(2)
        : '0.00';
    worksheet.addRow(['Tasa de Completitud:', `${conversionRate}%`]);

    // ========================================
    // RESUMEN DE PAGOS (SUSCRIPCIONES)
    // ========================================
    worksheet.addRow([]);
    const paymentSummaryRow = worksheet.addRow([
      'RESUMEN DE PAGOS (SUSCRIPCIONES)',
    ]);
    worksheet.mergeCells(
      `A${paymentSummaryRow.number}:L${paymentSummaryRow.number}`,
    );
    paymentSummaryRow.font = { size: 14, bold: true };
    paymentSummaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' },
    };

    // Filtrar solo pagos de suscripción
    const subscriptionPayments = payments.filter(
      (p) => p.paymentType === 'SUBSCRIPTION',
    );
    const completedPayments = subscriptionPayments.filter(
      (p) => p.status === 'completed',
    );
    const totalPayments = completedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0,
    );

    worksheet.addRow([
      'Total Pagos de Suscripción:',
      subscriptionPayments.length,
    ]);
    worksheet.addRow(['Pagos Completados:', completedPayments.length]);

    const paymentRevenueRow = worksheet.addRow([
      'INGRESOS POR SUSCRIPCIONES:',
      totalPayments,
    ]);
    paymentRevenueRow.font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
    };
    paymentRevenueRow.getCell(2).numFmt = '₡#,##0.00';
    // Aplicar color solo a las primeras 2 columnas
    paymentRevenueRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' },
    };
    paymentRevenueRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' },
    };

    // Total General
    worksheet.addRow([]);
    const grandTotalRow = worksheet.addRow([
      'INGRESOS TOTALES:',
      totalRevenue + totalPayments,
    ]);
    grandTotalRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    grandTotalRow.getCell(2).numFmt = '₡#,##0.00';
    // Aplicar color solo a las primeras 2 columnas
    grandTotalRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6B35' },
    };
    grandTotalRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6B35' },
    };

    // ========================================
    // AJUSTAR ANCHOS DE COLUMNA
    // ========================================
    worksheet.columns = [
      { width: 10 }, // ID Cita
      { width: 18 }, // Fecha Cita
      { width: 25 }, // Cliente
      { width: 28 }, // Email
      { width: 15 }, // Teléfono
      { width: 20 }, // Servicio
      { width: 14 }, // Duración
      { width: 14 }, // Estado
      { width: 15 }, // Precio Servicio
      { width: 15 }, // Monto Pago
      { width: 14 }, // Estado Pago
      { width: 20 }, // Referencia
    ];

    // Bordes para toda la tabla
    const lastRowNum = worksheet.lastRow?.number || 0;
    for (let i = 6; i <= lastRowNum; i++) {
      const row = worksheet.getRow(i);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    // Generar el buffer del Excel
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

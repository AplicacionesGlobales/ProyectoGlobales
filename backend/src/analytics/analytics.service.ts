import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import {
  RevenueAnalyticsResponse,
  PeriodComparison,
  DailyRevenueMetrics,
  WeeklyRevenueMetrics,
  MonthlyRevenueMetrics,
  AnnualRevenueMetrics,
  RevenueBreakdown,
  FinancialMetrics,
  OperatingCosts,
} from './types/revenue-metrics.types';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene métricas completas de revenue para un brand específico
   */
  async getRevenueMetrics(
    brandId: number,
    referenceDate?: Date,
  ): Promise<BaseResponseDto<RevenueAnalyticsResponse>> {
    try {
      // Verificar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        select: { id: true, name: true, isActive: true },
      });

      if (!brand) {
        return BaseResponseDto.singleError(404, `Brand with ID ${brandId} not found`);
      }

      const now = referenceDate || new Date();

      // Calcular métricas en paralelo
      const [daily, weekly, monthly, annual] = await Promise.all([
        this.calculateDailyMetrics(brandId, now),
        this.calculateWeeklyMetrics(brandId, now),
        this.calculateMonthlyMetrics(brandId, now),
        this.calculateAnnualMetrics(brandId, now),
      ]);

      // Preparar respuesta
      const response: RevenueAnalyticsResponse = {
        brandId: brand.id,
        brandName: brand.name,
        currency: 'USD',
        generatedAt: new Date().toISOString(),
        daily,
        weekly,
        monthly,
        annual,
        breakdown: {
          daily: await this.getRevenueBreakdown(brandId, ...this.getDayRange(now)),
          weekly: await this.getRevenueBreakdown(brandId, ...this.getWeekRange(now)),
          monthly: await this.getRevenueBreakdown(brandId, ...this.getMonthRange(now)),
          annual: await this.getRevenueBreakdown(brandId, ...this.getYearRange(now)),
        },
      };

      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      return BaseResponseDto.singleError(
        500,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Calcula métricas diarias (hoy vs ayer)
   */
  private async calculateDailyMetrics(
    brandId: number,
    referenceDate: Date,
  ): Promise<DailyRevenueMetrics> {
    const [todayStart, todayEnd] = this.getDayRange(referenceDate);
    const [yesterdayStart, yesterdayEnd] = this.getDayRange(
      new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000),
    );

    const [todayRevenue, yesterdayRevenue] = await Promise.all([
      this.getTotalRevenue(brandId, todayStart, todayEnd),
      this.getTotalRevenue(brandId, yesterdayStart, yesterdayEnd),
    ]);

    return {
      today: todayRevenue,
      yesterday: yesterdayRevenue,
      comparison: this.calculateComparison(todayRevenue, yesterdayRevenue),
      date: referenceDate.toISOString(),
    };
  }

  /**
   * Calcula métricas semanales (esta semana vs semana anterior)
   */
  private async calculateWeeklyMetrics(
    brandId: number,
    referenceDate: Date,
  ): Promise<WeeklyRevenueMetrics> {
    const [currentWeekStart, currentWeekEnd] = this.getWeekRange(referenceDate);
    const [previousWeekStart, previousWeekEnd] = this.getWeekRange(
      new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000),
    );

    const [currentWeekRevenue, previousWeekRevenue] = await Promise.all([
      this.getTotalRevenue(brandId, currentWeekStart, currentWeekEnd),
      this.getTotalRevenue(brandId, previousWeekStart, previousWeekEnd),
    ]);

    return {
      currentWeek: currentWeekRevenue,
      previousWeek: previousWeekRevenue,
      comparison: this.calculateComparison(currentWeekRevenue, previousWeekRevenue),
      weekStartDate: currentWeekStart.toISOString(),
      weekEndDate: currentWeekEnd.toISOString(),
    };
  }

  /**
   * Calcula métricas mensuales (este mes vs mes anterior)
   */
  private async calculateMonthlyMetrics(
    brandId: number,
    referenceDate: Date,
  ): Promise<MonthlyRevenueMetrics> {
    const [currentMonthStart, currentMonthEnd] = this.getMonthRange(referenceDate);
    const previousMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
    const [previousMonthStart, previousMonthEnd] = this.getMonthRange(previousMonth);

    const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
      this.getTotalRevenue(brandId, currentMonthStart, currentMonthEnd),
      this.getTotalRevenue(brandId, previousMonthStart, previousMonthEnd),
    ]);

    return {
      currentMonth: currentMonthRevenue,
      previousMonth: previousMonthRevenue,
      comparison: this.calculateComparison(currentMonthRevenue, previousMonthRevenue),
      month: `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`,
      year: referenceDate.getFullYear(),
    };
  }

  /**
   * Calcula métricas anuales (este año vs año anterior)
   */
  private async calculateAnnualMetrics(
    brandId: number,
    referenceDate: Date,
  ): Promise<AnnualRevenueMetrics> {
    const [currentYearStart, currentYearEnd] = this.getYearRange(referenceDate);
    const previousYear = new Date(referenceDate.getFullYear() - 1, 0, 1);
    const [previousYearStart, previousYearEnd] = this.getYearRange(previousYear);

    const [currentYearRevenue, previousYearRevenue] = await Promise.all([
      this.getTotalRevenue(brandId, currentYearStart, currentYearEnd),
      this.getTotalRevenue(brandId, previousYearStart, previousYearEnd),
    ]);

    return {
      currentYear: currentYearRevenue,
      previousYear: previousYearRevenue,
      comparison: this.calculateComparison(currentYearRevenue, previousYearRevenue),
      year: referenceDate.getFullYear(),
    };
  }

  /**
   * Calcula el desglose de ingresos para un período
   */
  private async getRevenueBreakdown(
    brandId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialMetrics> {
    const [appointmentsRevenue, paymentsRevenue, subscriptionCost] =
      await Promise.all([
        this.getAppointmentsRevenue(brandId, startDate, endDate),
        this.getPaymentsRevenue(brandId, startDate, endDate),
        this.getSubscriptionCost(brandId, startDate, endDate),
      ]);

    const revenue: RevenueBreakdown = {
      appointments: appointmentsRevenue,
      services: paymentsRevenue.services,
      products: paymentsRevenue.products,
      total:
        appointmentsRevenue +
        paymentsRevenue.services +
        paymentsRevenue.products,
    };

    const costs: OperatingCosts = {
      subscription: subscriptionCost,
    };

    const netRevenue = revenue.total - costs.subscription;

    return {
      revenue,
      costs,
      netRevenue,
    };
  }

  /**
   * Obtiene el total de ingresos (revenue de clientes) en un rango de fechas
   */
  private async getTotalRevenue(
    brandId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const [paymentsRevenue, appointmentsRevenue] = await Promise.all([
      this.getPaymentsRevenue(brandId, startDate, endDate),
      this.getAppointmentsRevenue(brandId, startDate, endDate),
    ]);

    return paymentsRevenue.services + paymentsRevenue.products + appointmentsRevenue;
  }

  /**
   * Calcula el costo de suscripción para el período especificado
   * Basado en el plan activo del brand, prorrateado según los días del período
   */
  private async getSubscriptionCost(
    brandId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const brandPlan = await this.prisma.brandPlan.findFirst({
      where: {
        brandId,
        isActive: true,
      },
      include: {
        plan: true,
      },
    });

    if (!brandPlan) {
      return 0; // No tiene plan activo
    }

    // Obtener precio mensual del plan
    const monthlyPrice = Number(brandPlan.price);

    // Calcular días en el período
    const periodDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Determinar el costo según el tipo de período
    let periodCost: number;

    if (periodDays <= 1) {
      // Diario: dividir entre 30 días
      periodCost = monthlyPrice / 30;
    } else if (periodDays <= 7) {
      // Semanal: dividir entre 30 y multiplicar por días
      periodCost = (monthlyPrice / 30) * periodDays;
    } else if (periodDays <= 31) {
      // Mensual: usar el precio completo del plan
      periodCost = monthlyPrice;
    } else if (periodDays >= 365) {
      // Anual completo: 12 meses exactos
      periodCost = monthlyPrice * 12;
    } else {
      // Períodos intermedios: calcular por días
      periodCost = (monthlyPrice / 30) * periodDays;
    }

    return Math.round(periodCost * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Obtiene ingresos de pagos de clientes (solo tipos que son INGRESOS para el brand)
   * Excluye SUBSCRIPTION que es un GASTO del brand hacia la plataforma
   */
  private async getPaymentsRevenue(
    brandId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ services: number; products: number }> {
    const payments = await this.prisma.payment.findMany({
      where: {
        brandId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: 'completed',
        paymentType: {
          in: ['SERVICE', 'PRODUCT'], // Solo ingresos
        },
      },
      select: {
        amount: true,
        paymentType: true,
      },
    });

    const services = payments
      .filter((p) => p.paymentType === 'SERVICE')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const products = payments
      .filter((p) => p.paymentType === 'PRODUCT')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { services, products };
  }

  /**
   * Obtiene ingresos de citas con precio
   */
  private async getAppointmentsRevenue(
    brandId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.appointment.aggregate({
      _sum: { price: true },
      where: {
        brandId,
        price: { not: null },
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return Number(result._sum.price) || 0;
  }

  /**
   * Calcula la comparación entre dos valores
   */
  private calculateComparison(current: number, previous: number): PeriodComparison {
    const difference = current - previous;
    const percentageChange = previous > 0 ? (difference / previous) * 100 : current > 0 ? 100 : 0;

    return {
      current,
      previous,
      difference: Math.round(difference * 100) / 100,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  }

  /**
   * Obtiene el rango de fechas de un día (00:00:00 - 23:59:59)
   */
  private getDayRange(date: Date): [Date, Date] {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    return [start, end];
  }

  /**
   * Obtiene el rango de fechas de una semana (lunes - domingo)
   */
  private getWeekRange(date: Date): [Date, Date] {
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajuste para que lunes sea día 1

    const start = new Date(date);
    start.setDate(date.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return [start, end];
  }

  /**
   * Obtiene el rango de fechas de un mes
   */
  private getMonthRange(date: Date): [Date, Date] {
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return [start, end];
  }

  /**
   * Obtiene el rango de fechas de un año
   */
  private getYearRange(date: Date): [Date, Date] {
    const start = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
    return [start, end];
  }
}

// client/services/client-stats.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ClientStatsDto,
  ClientStatsResponseDto,
  TopClientDto,
  ClientsSummaryResponseDto,
  ClientGrowthDto,
  ClientSegmentationDto,
  ClientRetentionDto,
  AppointmentStatsDto,
  RevenueStatsDto,
} from '../dto';

@Injectable()
export class ClientStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener estadísticas básicas del cliente
   */
  async getClientStats(
    clientId: number,
    brandId: number,
  ): Promise<ClientStatsDto> {
    console.log('📊 Obteniendo estadísticas básicas del cliente:', clientId);

    // TODO: Implementar cuando esté el módulo de appointments
    const stats: ClientStatsDto = {
      totalAppointments: 0,
      lastVisit: undefined,
    };

    // Aquí iría la lógica real para obtener:
    // - Total de citas del cliente
    // - Fecha de última visita

    return stats;
  }

  /**
   * Obtener estadísticas detalladas del cliente con período específico
   */
  async getClientStatsDetailed(
    clientId: number,
    brandId: number,
    period: string,
  ): Promise<ClientStatsResponseDto> {
    console.log(
      '📊 Obteniendo estadísticas detalladas del cliente:',
      clientId,
      'período:',
      period,
    );

    // Obtener información del cliente
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        userId: clientId,
        brandId: brandId,
      },
      include: {
        user: true,
      },
    });

    if (!userBrand) {
      throw new Error('Cliente no encontrado');
    }

    // Calcular fechas según el período
    const dateRange = this.getDateRangeFromPeriod(period);

    // TODO: Implementar cuando esté el módulo de appointments y payments
    const appointmentStats: AppointmentStatsDto = {
      total: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    };

    const revenueStats: RevenueStatsDto = {
      total: 0,
      average: 0,
      lastPayment: 0,
    };

    // Determinar tipo de cliente basado en frecuencia
    const clientType = this.determineClientType(appointmentStats.total);

    const response: ClientStatsResponseDto = {
      clientId: clientId,
      brandId: brandId,
      appointments: appointmentStats,
      revenue: revenueStats,
      lastVisit: undefined, // TODO: Obtener de appointments
      nextAppointment: undefined, // TODO: Obtener de appointments
      memberSince: userBrand.createdAt,
      clientType: clientType,
      averageRating: 0, // TODO: Obtener de ratings/reviews
      favoriteServices: [], // TODO: Obtener de appointments/services
      period: period,
    };

    return response;
  }

  /**
   * Obtener los mejores clientes del brand
   */
  async getTopClients(
    brandId: number,
    limit: number,
    period: string,
  ): Promise<TopClientDto[]> {
    console.log(
      '📊 Obteniendo top',
      limit,
      'clientes del brand:',
      brandId,
      'período:',
      period,
    );

    // Obtener todos los clientes del brand
    const userBrands = await this.prisma.userBrand.findMany({
      where: {
        brandId: brandId,
        user: {
          role: 'CLIENT',
          isActive: true,
        },
      },
      include: {
        user: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc', // TODO: Ordenar por total de citas o revenue cuando esté disponible
      },
    });

    // Mapear a TopClientDto
    const topClients: TopClientDto[] = await Promise.all(
      userBrands.map(async (ub) => {
        // TODO: Obtener estadísticas reales cuando estén los módulos
        return {
          id: ub.user.id,
          email: ub.user.email,
          firstName: ub.user.firstName || '',
          lastName: ub.user.lastName || undefined,
          totalAppointments: 0, // TODO: Obtener de appointments
          totalRevenue: 0, // TODO: Obtener de payments
          lastVisit: undefined, // TODO: Obtener de appointments
          averageRating: 0, // TODO: Obtener de ratings
          clientType: 'new' as const, // TODO: Calcular basado en frecuencia
        };
      }),
    );

    return topClients;
  }

  /**
   * Obtener resumen general de clientes del brand
   */
  async getClientsSummary(
    brandId: number,
    period: string,
  ): Promise<ClientsSummaryResponseDto> {
    console.log(
      '📊 Obteniendo resumen de clientes del brand:',
      brandId,
      'período:',
      period,
    );

    const dateRange = this.getDateRangeFromPeriod(period);

    // Obtener conteos básicos
    const totalClients = await this.prisma.userBrand.count({
      where: {
        brandId: brandId,
        user: {
          role: 'CLIENT',
        },
      },
    });

    const activeClients = await this.prisma.userBrand.count({
      where: {
        brandId: brandId,
        user: {
          role: 'CLIENT',
          isActive: true,
        },
      },
    });

    const inactiveClients = totalClients - activeClients;

    // Obtener nuevos clientes en el período
    const newClientsCount = await this.prisma.userBrand.count({
      where: {
        brandId: brandId,
        user: {
          role: 'CLIENT',
        },
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
    });

    // TODO: Calcular métricas más complejas cuando estén los módulos
    const growth: ClientGrowthDto = {
      newClients: newClientsCount,
      returningClients: 0, // TODO: Calcular de appointments
      lostClients: 0, // TODO: Calcular basado en inactividad
      growthRate: 0, // TODO: Calcular tasa de crecimiento
    };

    const segmentation: ClientSegmentationDto = {
      new: 0, // TODO: Clientes con < 3 visitas
      regular: 0, // TODO: Clientes con 3-10 visitas
      frequent: 0, // TODO: Clientes con 11-20 visitas
      vip: 0, // TODO: Clientes con > 20 visitas
      inactive: inactiveClients,
    };

    const retention: ClientRetentionDto = {
      rate: 0, // TODO: Calcular tasa de retención
      averageVisitsPerClient: 0, // TODO: Calcular de appointments
      averageDaysBetweenVisits: 0, // TODO: Calcular de appointments
    };

    const response: ClientsSummaryResponseDto = {
      totalClients,
      activeClients,
      inactiveClients,
      growth,
      segmentation,
      retention,
      averageClientValue: 0, // TODO: Calcular de payments
      averageSatisfaction: 0, // TODO: Calcular de ratings
      period,
      generatedAt: new Date(),
    };

    return response;
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtener rango de fechas basado en el período
   */
  private getDateRangeFromPeriod(period: string): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Fecha arbitraria antigua
        break;
      default:
        // Por defecto últimos 30 días
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  /**
   * Determinar tipo de cliente basado en número de citas
   */
  private determineClientType(
    totalAppointments: number,
  ): 'new' | 'regular' | 'frequent' | 'vip' {
    if (totalAppointments === 0) return 'new';
    if (totalAppointments <= 3) return 'new';
    if (totalAppointments <= 10) return 'regular';
    if (totalAppointments <= 20) return 'frequent';
    return 'vip';
  }

  /**
   * Calcular tasa de crecimiento
   */
  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}

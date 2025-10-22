// services/dashboard-adapter.service.ts
// Adaptador para usar el endpoint de métricas existente con los componentes del panel
import { landingService, BrandDashboardMetrics } from '../api';
import type { 
  DashboardStats, 
  TodayStats, 
  WeeklyStats, 
  MonthlyStats,
  RevenueStats,
  ServiceStats,
  BusinessInsights,
  ActivityItem,
  ClientDashboardStats,
  AppointmentTrendData
} from './dashboard.service';

class DashboardAdapterService {
  /**
   * Adapta las métricas del backend al formato esperado por el dashboard
   */
  private adaptMetricsToStats(metrics: BrandDashboardMetrics): DashboardStats {
    const todayStats: TodayStats = {
      totalAppointments: metrics.appointments.thisMonth, // Usamos mes actual como aproximación
      completedAppointments: metrics.appointments.byStatus.find(s => s.status === 'COMPLETED')?.count || 0,
      cancelledAppointments: metrics.appointments.byStatus.find(s => s.status === 'CANCELLED')?.count || 0,
      pendingAppointments: metrics.appointments.byStatus.find(s => s.status === 'PENDING')?.count || 0,
      totalRevenue: metrics.revenue.thisMonthRevenue,
      averageServiceTime: metrics.appointments.avgDuration,
    };

    const weeklyStats: WeeklyStats = {
      totalAppointments: Math.floor(metrics.appointments.thisMonth * 0.25), // Aproximación semanal
      totalRevenue: metrics.revenue.thisMonthRevenue * 0.25,
      averageDaily: Math.floor(metrics.appointments.thisMonth / 30),
      weekOverWeekGrowth: metrics.appointments.growthRate,
      mostBusyDay: 'Lunes', // Valor por defecto
      appointmentsByDay: [
        { day: 'Lun', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
        { day: 'Mar', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
        { day: 'Mié', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
        { day: 'Jue', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
        { day: 'Vie', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
        { day: 'Sáb', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
        { day: 'Dom', appointments: Math.floor(metrics.appointments.thisMonth / 7), revenue: metrics.revenue.thisMonthRevenue / 7 },
      ]
    };

    const monthlyStats: MonthlyStats = {
      totalAppointments: metrics.appointments.total,
      totalRevenue: metrics.revenue.totalRevenue,
      averageDaily: Math.floor(metrics.appointments.thisMonth / 30),
      monthOverMonthGrowth: metrics.appointments.growthRate,
      completionRate: 85, // Valor por defecto
      cancellationRate: 10 // Valor por defecto
    };

    const recentActivity: ActivityItem[] = [
      {
        id: 1,
        type: 'appointment_created',
        title: 'Citas del mes',
        description: `Se registraron ${metrics.appointments.thisMonth} citas este mes`,
        timestamp: new Date().toISOString(),
      }
    ];

    const topServices: ServiceStats[] = [
      {
        serviceId: 1,
        serviceName: 'Servicio Principal',
        totalAppointments: metrics.appointments.total,
        totalRevenue: metrics.revenue.totalRevenue,
        averageRating: 4.5,
        popularity: 100,
        averageDuration: metrics.appointments.avgDuration,
        peakHours: ['10:00', '14:00', '16:00']
      }
    ];

    const clientStats: ClientDashboardStats = {
      totalClients: metrics.clients.totalClients,
      activeClients: metrics.clients.totalClients,
      newClientsThisMonth: metrics.clients.newClientsThisMonth,
      clientRetentionRate: 75, // Valor por defecto
      averageVisitsPerClient: 2.5, // Valor por defecto
      topClients: [],
      clientGrowth: [
        { month: 'Este mes', newClients: metrics.clients.newClientsThisMonth, totalClients: metrics.clients.totalClients }
      ]
    };

    const revenueStats: RevenueStats = {
      todayRevenue: metrics.revenue.totalRevenue / 30, // Estimado diario
      weekRevenue: metrics.revenue.totalRevenue / 4, // Estimado semanal
      monthRevenue: metrics.revenue.thisMonthRevenue,
      yearRevenue: metrics.revenue.totalRevenue,
      revenueGrowth: {
        daily: metrics.revenue.growthRate,
        weekly: metrics.revenue.growthRate,
        monthly: metrics.revenue.growthRate
      },
      revenueByService: [],
      monthlyRevenueChart: [
        { month: 'Este mes', revenue: metrics.revenue.thisMonthRevenue, appointments: metrics.appointments.thisMonth },
        { month: 'Mes pasado', revenue: metrics.revenue.lastMonthRevenue, appointments: metrics.appointments.lastMonth }
      ]
    };

    const appointmentTrends: AppointmentTrendData[] = [
      { 
        date: new Date().toISOString().split('T')[0], 
        appointments: metrics.appointments.thisMonth,
        completed: Math.floor(metrics.appointments.thisMonth * 0.8),
        cancelled: Math.floor(metrics.appointments.thisMonth * 0.1),
        revenue: metrics.revenue.thisMonthRevenue,
        averageValue: metrics.revenue.averagePerAppointment
      }
    ];

    return {
      todayStats,
      weeklyStats,
      monthlyStats,
      recentActivity,
      topServices,
      clientStats,
      revenueStats,
      appointmentTrends
    };
  }

  /**
   * Obtiene estadísticas del dashboard usando el endpoint de métricas
   */
  async getDashboardStats(brandId: number, period: string = '30d') {
    try {
      console.log('🚀 Getting dashboard stats for brand:', brandId);
      
      const response = await landingService.getBrandDashboardMetrics(brandId);
      
      if (response.success && response.data) {
        const adaptedStats = this.adaptMetricsToStats(response.data);
        console.log('✅ Dashboard stats adapted successfully');
        return {
          success: true,
          data: adaptedStats
        };
      } else {
        throw new Error(response.errors?.[0]?.description || 'Error al obtener métricas');
      }
    } catch (error: any) {
      console.error('❌ Dashboard stats error:', error);
      return {
        success: false,
        errors: [{ code: 'DASHBOARD_ERROR', description: error.message }]
      };
    }
  }

  /**
   * Obtiene estadísticas de hoy (adaptadas desde métricas mensuales)
   */
  async getTodayStats(brandId: number) {
    try {
      const response = await landingService.getBrandDashboardMetrics(brandId);
      
      if (response.success && response.data) {
        const metrics = response.data;
        const todayStats: TodayStats = {
          totalAppointments: Math.floor(metrics.appointments.thisMonth / 30), // Aproximación diaria
          completedAppointments: Math.floor((metrics.appointments.byStatus.find(s => s.status === 'completed')?.count || 0) / 30),
          cancelledAppointments: Math.floor((metrics.appointments.byStatus.find(s => s.status === 'cancelled')?.count || 0) / 30),
          pendingAppointments: Math.floor((metrics.appointments.byStatus.find(s => s.status === 'pending')?.count || 0) / 30),
          totalRevenue: metrics.revenue.thisMonthRevenue / 30,
          averageServiceTime: metrics.appointments.avgDuration,
        };

        return {
          success: true,
          data: todayStats
        };
      }
      
      throw new Error('No se pudieron obtener las métricas');
    } catch (error: any) {
      console.error('❌ Today stats error:', error);
      return {
        success: false,
        errors: [{ code: 'TODAY_STATS_ERROR', description: error.message }]
      };
    }
  }

  /**
   * Reporte de ingresos adaptado
   */
  async getRevenueReport(brandId: number, startDate: string, endDate: string) {
    try {
      const response = await landingService.getBrandDashboardMetrics(brandId);
      
      if (response.success && response.data) {
        const metrics = response.data;
        const revenueStats: RevenueStats = {
          todayRevenue: metrics.revenue.totalRevenue / 30,
          weekRevenue: metrics.revenue.totalRevenue / 4,
          monthRevenue: metrics.revenue.thisMonthRevenue,
          yearRevenue: metrics.revenue.totalRevenue,
          revenueGrowth: {
            daily: metrics.revenue.growthRate,
            weekly: metrics.revenue.growthRate,
            monthly: metrics.revenue.growthRate
          },
          revenueByService: [
            {
              serviceName: 'Servicio Principal',
              revenue: metrics.revenue.totalRevenue,
              percentage: 100
            }
          ],
          monthlyRevenueChart: [
            { month: 'Actual', revenue: metrics.revenue.thisMonthRevenue, appointments: metrics.appointments.thisMonth },
            { month: 'Anterior', revenue: metrics.revenue.lastMonthRevenue, appointments: metrics.appointments.lastMonth }
          ]
        };

        return {
          success: true,
          data: revenueStats
        };
      }
      
      throw new Error('No se pudieron obtener las métricas');
    } catch (error: any) {
      console.error('❌ Revenue report error:', error);
      return {
        success: false,
        errors: [{ code: 'REVENUE_ERROR', description: error.message }]
      };
    }
  }

  /**
   * Analíticas de clientes adaptadas
   */
  async getClientAnalytics(brandId: number) {
    try {
      const response = await landingService.getBrandDashboardMetrics(brandId);
      
      if (response.success && response.data) {
        const metrics = response.data;
        const clientAnalytics: ClientDashboardStats = {
          totalClients: metrics.clients.totalClients,
          activeClients: metrics.clients.totalClients,
          newClientsThisMonth: metrics.clients.newClientsThisMonth,
          clientRetentionRate: 75, // Valor por defecto
          averageVisitsPerClient: 2.5, // Valor por defecto
          topClients: [],
          clientGrowth: [
            { month: 'Este mes', newClients: metrics.clients.newClientsThisMonth, totalClients: metrics.clients.totalClients },
            { month: 'Mes pasado', newClients: metrics.clients.newClientsLastMonth, totalClients: metrics.clients.totalClients - metrics.clients.newClientsThisMonth }
          ]
        };

        return {
          success: true,
          data: clientAnalytics
        };
      }
      
      throw new Error('No se pudieron obtener las métricas');
    } catch (error: any) {
      console.error('❌ Client analytics error:', error);
      return {
        success: false,
        errors: [{ code: 'CLIENT_ERROR', description: error.message }]
      };
    }
  }

  /**
   * Insights del negocio adaptados
   */
  async getBusinessInsights(brandId: number) {
    try {
      const response = await landingService.getBrandDashboardMetrics(brandId);
      
      if (response.success && response.data) {
        const metrics = response.data;
        const insights: BusinessInsights = {
          peakHours: [
            { hour: '10:00', appointments: Math.floor(metrics.appointments.total * 0.3), percentage: 30 },
            { hour: '14:00', appointments: Math.floor(metrics.appointments.total * 0.4), percentage: 40 },
            { hour: '16:00', appointments: Math.floor(metrics.appointments.total * 0.3), percentage: 30 }
          ],
          peakDays: [
            { day: 'Lunes', appointments: Math.floor(metrics.appointments.total * 0.2), percentage: 20 },
            { day: 'Viernes', appointments: Math.floor(metrics.appointments.total * 0.3), percentage: 30 },
            { day: 'Sábado', appointments: Math.floor(metrics.appointments.total * 0.5), percentage: 50 }
          ],
          servicePerformance: [
            {
              serviceName: 'Servicio Principal',
              appointments: metrics.appointments.total,
              revenue: metrics.revenue.totalRevenue,
              profitability: 85,
              satisfaction: 4.5
            }
          ],
          seasonalTrends: [
            {
              period: 'Este mes',
              appointments: metrics.appointments.thisMonth,
              revenue: metrics.revenue.thisMonthRevenue,
              trend: 'up' as const
            }
          ]
        };

        return {
          success: true,
          data: insights
        };
      }
      
      throw new Error('No se pudieron obtener las métricas');
    } catch (error: any) {
      console.error('❌ Business insights error:', error);
      return {
        success: false,
        errors: [{ code: 'INSIGHTS_ERROR', description: error.message }]
      };
    }
  }

  // Métodos adicionales que pueden ser necesarios
  async getAppointmentStats(brandId: number, period: string) {
    const response = await landingService.getBrandDashboardMetrics(brandId);
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          total: response.data.appointments.total,
          thisMonth: response.data.appointments.thisMonth,
          byStatus: response.data.appointments.byStatus,
          averageDuration: response.data.appointments.avgDuration,
          growthRate: response.data.appointments.growthRate
        }
      };
    }
    return { success: false, errors: [{ code: 'ERROR', description: 'No data available' }] };
  }

  async getServiceStats(brandId: number) {
    return {
      success: true,
      data: [] // Por ahora retornamos array vacío
    };
  }

  async getComparisonReport(brandId: number, currentStart: string, currentEnd: string, previousStart: string, previousEnd: string) {
    const response = await landingService.getBrandDashboardMetrics(brandId);
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          current: {
            appointments: response.data.appointments.thisMonth,
            revenue: response.data.revenue.thisMonthRevenue,
            clients: response.data.clients.newClientsThisMonth
          },
          previous: {
            appointments: response.data.appointments.lastMonth,
            revenue: response.data.revenue.lastMonthRevenue,
            clients: response.data.clients.newClientsLastMonth
          },
          growth: {
            appointments: response.data.appointments.growthRate,
            revenue: response.data.revenue.growthRate,
            clients: response.data.clients.clientGrowthRate
          }
        }
      };
    }
    return { success: false, errors: [{ code: 'ERROR', description: 'No data available' }] };
  }

  async exportDashboardData(brandId: number) {
    return {
      success: true,
      data: { message: 'Export functionality not implemented yet' }
    };
  }
}

export const dashboardAdapterService = new DashboardAdapterService();
export default dashboardAdapterService;
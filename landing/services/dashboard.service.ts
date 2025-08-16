// services/dashboardService.ts
import { apiClient } from '../app/api/client';
import { API_ENDPOINTS } from '../app/api/config';

// Interfaces para Dashboard Statistics
export interface DashboardStats {
  todayStats: TodayStats;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
  recentActivity: ActivityItem[];
  topServices: ServiceStats[];
  clientStats: ClientDashboardStats;
  revenueStats: RevenueStats;
  appointmentTrends: AppointmentTrendData[];
}

export interface TodayStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  averageServiceTime: number;
  nextAppointment?: {
    id: number;
    clientName: string;
    serviceName: string;
    startTime: string;
    status: string;
  };
}

export interface WeeklyStats {
  totalAppointments: number;
  totalRevenue: number;
  averageDaily: number;
  weekOverWeekGrowth: number;
  mostBusyDay: string;
  appointmentsByDay: Array<{
    day: string;
    appointments: number;
    revenue: number;
  }>;
}

export interface MonthlyStats {
  totalAppointments: number;
  totalRevenue: number;
  averageDaily: number;
  monthOverMonthGrowth: number;
  completionRate: number;
  cancellationRate: number;
}

export interface ActivityItem {
  id: number;
  type: 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'client_created' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface ServiceStats {
  serviceId: number;
  serviceName: string;
  totalAppointments: number;
  totalRevenue: number;
  averageRating?: number;
  popularity: number; // porcentaje
  averageDuration: number;
  peakHours: string[];
}

export interface ClientDashboardStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientRetentionRate: number;
  averageVisitsPerClient: number;
  topClients: Array<{
    id: number;
    name: string;
    totalVisits: number;
    totalSpent: number;
    lastVisit: string;
  }>;
  clientGrowth: Array<{
    month: string;
    newClients: number;
    totalClients: number;
  }>;
}

export interface RevenueStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  revenueGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  revenueByService: Array<{
    serviceName: string;
    revenue: number;
    percentage: number;
  }>;
  monthlyRevenueChart: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }>;
}

export interface AppointmentTrendData {
  date: string;
  appointments: number;
  completed: number;
  cancelled: number;
  revenue: number;
  averageValue: number;
}

export interface BusinessInsights {
  peakHours: Array<{
    hour: string;
    appointments: number;
    percentage: number;
  }>;
  peakDays: Array<{
    day: string;
    appointments: number;
    percentage: number;
  }>;
  servicePerformance: Array<{
    serviceName: string;
    appointments: number;
    revenue: number;
    profitability: number;
    satisfaction: number;
  }>;
  seasonalTrends: Array<{
    period: string;
    appointments: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface ComparisonPeriod {
  current: {
    appointments: number;
    revenue: number;
    clients: number;
  };
  previous: {
    appointments: number;
    revenue: number;
    clients: number;
  };
  growth: {
    appointments: number;
    revenue: number;
    clients: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    code: string;
    description: string;
  }>;
}

class DashboardService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // ==================== DASHBOARD OVERVIEW ====================

  // Obtener todas las estadísticas del dashboard
  async getDashboardStats(brandId: number, period: string = '30d'): Promise<ApiResponse<DashboardStats>> {
    try {
      console.log('🚀 Getting dashboard stats:', { brandId, period });
      const response = await apiClient.get<DashboardStats>(
        `${API_ENDPOINTS.BRAND.GET_STATS(brandId)}?type=dashboard&period=${period}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Dashboard stats response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Dashboard stats error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'DASHBOARD_STATS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo estadísticas del dashboard'
          }
        ]
      };
    }
  }

  // Obtener estadísticas de hoy
  async getTodayStats(brandId: number): Promise<ApiResponse<TodayStats>> {
    try {
      console.log('🚀 Getting today stats:', brandId);
      const response = await apiClient.get<TodayStats>(
        `/brand/${brandId}/reports/today-stats`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Today stats response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Today stats error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'TODAY_STATS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo estadísticas de hoy'
          }
        ]
      };
    }
  }

  // ==================== REVENUE REPORTS ====================

  // Obtener reporte de ingresos
  async getRevenueReport(
    brandId: number, 
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<RevenueStats>> {
    try {
      console.log('🚀 Getting revenue report:', { brandId, startDate, endDate });
      const response = await apiClient.get<RevenueStats>(
        `/brand/${brandId}/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Revenue report response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Revenue report error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'REVENUE_REPORT_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo reporte de ingresos'
          }
        ]
      };
    }
  }

  // ==================== APPOINTMENT ANALYTICS ====================

  // Obtener analytics de citas
  async getAppointmentAnalytics(
    brandId: number, 
    period: string = '30d'
  ): Promise<ApiResponse<AppointmentTrendData[]>> {
    try {
      console.log('🚀 Getting appointment analytics:', { brandId, period });
      const response = await apiClient.get<AppointmentTrendData[]>(
        `/brand/${brandId}/reports/appointments?period=${period}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment analytics response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment analytics error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_ANALYTICS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo analytics de citas'
          }
        ]
      };
    }
  }

  // ==================== SERVICE PERFORMANCE ====================

  // Obtener performance de servicios
  async getServicePerformance(brandId: number): Promise<ApiResponse<ServiceStats[]>> {
    try {
      console.log('🚀 Getting service performance:', brandId);
      const response = await apiClient.get<ServiceStats[]>(
        `/brand/${brandId}/reports/services`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Service performance response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Service performance error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'SERVICE_PERFORMANCE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo performance de servicios'
          }
        ]
      };
    }
  }

  // ==================== CLIENT ANALYTICS ====================

  // Obtener analytics de clientes
  async getClientAnalytics(brandId: number): Promise<ApiResponse<ClientDashboardStats>> {
    try {
      console.log('🚀 Getting client analytics:', brandId);
      const response = await apiClient.get<ClientDashboardStats>(
        `/brand/${brandId}/reports/clients`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Client analytics response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Client analytics error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_ANALYTICS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo analytics de clientes'
          }
        ]
      };
    }
  }

  // ==================== BUSINESS INSIGHTS ====================

  // Obtener insights del negocio
  async getBusinessInsights(brandId: number): Promise<ApiResponse<BusinessInsights>> {
    try {
      console.log('🚀 Getting business insights:', brandId);
      const response = await apiClient.get<BusinessInsights>(
        `/brand/${brandId}/reports/insights`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Business insights response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Business insights error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BUSINESS_INSIGHTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo insights del negocio'
          }
        ]
      };
    }
  }

  // ==================== ACTIVITY FEED ====================

  // Obtener actividad reciente
  async getRecentActivity(
    brandId: number, 
    limit: number = 20
  ): Promise<ApiResponse<ActivityItem[]>> {
    try {
      console.log('🚀 Getting recent activity:', { brandId, limit });
      const response = await apiClient.get<ActivityItem[]>(
        `${API_ENDPOINTS.BRAND.GET_ACTIVITY(brandId)}?limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Recent activity response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Recent activity error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'RECENT_ACTIVITY_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo actividad reciente'
          }
        ]
      };
    }
  }

  // ==================== COMPARATIVE ANALYSIS ====================

  // Comparar períodos
  async getPerformanceComparison(
    brandId: number,
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ): Promise<ApiResponse<ComparisonPeriod>> {
    try {
      console.log('🚀 Getting performance comparison:', { 
        brandId, currentStart, currentEnd, previousStart, previousEnd 
      });
      const response = await apiClient.get<ComparisonPeriod>(
        `/brand/${brandId}/reports/comparison?currentStart=${currentStart}&currentEnd=${currentEnd}&previousStart=${previousStart}&previousEnd=${previousEnd}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Performance comparison response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Performance comparison error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'PERFORMANCE_COMPARISON_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo comparación de performance'
          }
        ]
      };
    }
  }

  // ==================== EXPORT DATA ====================

  // Exportar datos del dashboard
  async exportDashboardData(
    brandId: number,
    format: 'pdf' | 'excel' | 'csv',
    period: string = '30d'
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      console.log('🚀 Exporting dashboard data:', { brandId, format, period });
      const response = await apiClient.post<{ downloadUrl: string }>(
        `/brand/${brandId}/reports/export`,
        { format, period },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Export response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Export error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'EXPORT_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error exportando datos'
          }
        ]
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error' };
    }
  }
}

export const dashboardService = new DashboardService();
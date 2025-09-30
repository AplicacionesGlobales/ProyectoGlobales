import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { 
  BusinessTypeDto, 
  FeatureDto, 
  PlanDto, 
  LandingConfigDto, 
  DashboardMetricsDto,
  BrandDashboardMetricsDto,
  BusinessMetrics,
  AppointmentMetrics,
  RevenueMetrics,
  UserMetrics,
  ActivityMetrics,
  TrendsMetrics,
  BrandInfo,
  BrandAppointmentMetrics,
  BrandClientMetrics,
  BrandRevenueMetrics,
  BrandActivityMetrics,
  BusinessTypeDistribution,
  AppointmentStatusCount,
  PaymentStatusDistribution,
  ActivityTypeCount,
  HourActivityCount,
  MilestoneCount,
  DailyMetric,
  MonthlyMetric
} from './types';

@Injectable()
export class LandingDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getLandingConfig(): Promise<BaseResponseDto<LandingConfigDto>> {
    try {
      // Optimized: Get all data in parallel //
      const [businessTypes, features, plans] = await Promise.all([
        this.prisma.businessType.findMany({
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { title: 'asc' }],
        }),
        this.prisma.feature.findMany({
          where: { isActive: true },
          orderBy: [
            { category: 'asc' },
            { order: 'asc' },
            { title: 'asc' }
          ],
        }),
        this.prisma.plan.findMany({
          where: { isActive: true },
          orderBy: { type: 'asc' },
        }),
      ]);

      // Transform data
      const transformedBusinessTypes: BusinessTypeDto[] = businessTypes.map(bt => ({
        id: bt.id,
        key: bt.key,
        title: bt.title,
        subtitle: bt.subtitle || undefined,
        description: bt.description,
        icon: bt.icon,
        order: bt.order,
      }));

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      const transformedPlans: PlanDto[] = plans.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        description: p.description || undefined,
        basePrice: Number(p.basePrice),
      }));

      const config: LandingConfigDto = {
        businessTypes: transformedBusinessTypes,
        features: transformedFeatures,
        plans: transformedPlans,
      };

      return BaseResponseDto.success(config);
    } catch (error) {
      console.error('Error getting landing config:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getBusinessTypes(): Promise<BaseResponseDto<BusinessTypeDto[]>> {
    try {
      const businessTypes = await this.prisma.businessType.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { title: 'asc' }],
      });

      const transformedBusinessTypes: BusinessTypeDto[] = businessTypes.map(bt => ({
        id: bt.id,
        key: bt.key,
        title: bt.title,
        subtitle: bt.subtitle || undefined,
        description: bt.description,
        icon: bt.icon,
        order: bt.order,
      }));

      return BaseResponseDto.success(transformedBusinessTypes);
    } catch (error) {
      console.error('Error getting business types:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' }
        ],
      });

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      return BaseResponseDto.success(transformedFeatures);
    } catch (error) {
      console.error('Error getting features:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getFeaturesForBusinessType(businessTypeKey: string): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: {
          isActive: true,
          businessTypes: {
            has: businessTypeKey,
          },
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' }
        ],
      });

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      return BaseResponseDto.success(transformedFeatures);
    } catch (error) {
      console.error('Error getting features for business type:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getPlans(): Promise<BaseResponseDto<PlanDto[]>> {
    try {
      const plans = await this.prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { type: 'asc' },
      });

      const transformedPlans: PlanDto[] = plans.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        description: p.description || undefined,
        basePrice: Number(p.basePrice),
      }));

      return BaseResponseDto.success(transformedPlans);
    } catch (error) {
      console.error('Error getting plans:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getBusinessTypeWithFeatures(businessTypeKey: string): Promise<BaseResponseDto<BusinessTypeDto>> {
    try {
      const businessType = await this.prisma.businessType.findUnique({
        where: { key: businessTypeKey, isActive: true },
      });

      if (!businessType) {
        return BaseResponseDto.singleError(404, `Business type with key '${businessTypeKey}' not found`);
      }

      // Get recommended features for this business type
      const features = await this.prisma.feature.findMany({
        where: {
          isActive: true,
          businessTypes: {
            has: businessTypeKey,
          },
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' }
        ],
      });

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      const transformedBusinessType: BusinessTypeDto = {
        id: businessType.id,
        key: businessType.key,
        title: businessType.title,
        subtitle: businessType.subtitle || undefined,
        description: businessType.description,
        icon: businessType.icon,
        order: businessType.order,
        recommendedFeatures: transformedFeatures,
      };

      return BaseResponseDto.success(transformedBusinessType);
    } catch (error) {
      console.error('Error getting business type with features:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getDashboardMetrics(): Promise<BaseResponseDto<DashboardMetricsDto>> {
    try {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Ejecutar todas las consultas en paralelo para optimizar performance
      const [
        // Business metrics
        totalBrands,
        activeBrands,
        newBrandsThisMonth,
        newBrandsLastMonth,
        brandsByBusinessType,
        
        // Appointment metrics
        totalAppointments,
        appointmentsThisMonth,
        appointmentsLastMonth,
        appointmentsByStatus,
        appointmentRevenue,
        
        // Revenue metrics
        subscriptionRevenue,
        paymentsByStatus,
        
        // User metrics
        totalUsers,
        totalClients,
        activeUsers,
        newUsersThisMonth,
        clientAppointmentStats,
        
        // Activity metrics
        totalActivities,
        activitiesThisMonth,
        activitiesByType,
        activitiesByHour,
        milestoneActivities,
        
        // Trends data
        dailyAppointments,
        dailyRevenue,
        dailyNewBrands,
        monthlyStats
      ] = await Promise.all([
        // Business metrics queries
        this.prisma.brand.count(),
        this.prisma.brand.count({ where: { isActive: true } }),
        this.prisma.brand.count({
          where: { createdAt: { gte: startOfThisMonth } }
        }),
        this.prisma.brand.count({
          where: { 
            createdAt: { 
              gte: startOfLastMonth, 
              lt: startOfThisMonth 
            } 
          }
        }),
        this.prisma.brand.groupBy({
          by: ['businessType'],
          _count: { businessType: true },
          where: { isActive: true }
        }),
        
        // Appointment metrics queries
        this.prisma.appointment.count(),
        this.prisma.appointment.count({
          where: { createdAt: { gte: startOfThisMonth } }
        }),
        this.prisma.appointment.count({
          where: { 
            createdAt: { 
              gte: startOfLastMonth, 
              lt: startOfThisMonth 
            } 
          }
        }),
        this.prisma.appointment.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.prisma.appointment.aggregate({
          _sum: { price: true },
          where: { 
            price: { not: null },
            status: { in: ['COMPLETED', 'CONFIRMED'] }
          }
        }),
        
        // Revenue metrics queries
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'completed' }
        }),
        this.prisma.payment.groupBy({
          by: ['status'],
          _count: { status: true },
          _sum: { amount: true }
        }),
        
        // User metrics queries
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'CLIENT' } }),
        this.prisma.user.count({
          where: { 
            isActive: true,
            clientActivities: {
              some: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          }
        }),
        this.prisma.user.count({
          where: { 
            createdAt: { gte: startOfThisMonth },
            role: 'CLIENT'
          }
        }),
        this.prisma.appointment.groupBy({
          by: ['clientId'],
          _count: { clientId: true },
          where: { clientId: { not: null } }
        }),
        
        // Activity metrics queries
        this.prisma.clientActivity.count(),
        this.prisma.clientActivity.count({
          where: { createdAt: { gte: startOfThisMonth } }
        }),
        this.prisma.clientActivity.groupBy({
          by: ['type'],
          _count: { type: true }
        }),
        this.getActivityByHour(thirtyDaysAgo),
        this.prisma.clientActivity.groupBy({
          by: ['type'],
          _count: { type: true },
          where: {
            type: {
              in: [
                'MILESTONE_10_VISITS',
                'MILESTONE_25_VISITS', 
                'MILESTONE_50_VISITS',
                'MILESTONE_100_VISITS'
              ]
            }
          }
        }),
        
        // Trends queries - usando Prisma en lugar de SQL raw
        this.getDaily30DaysAppointments(thirtyDaysAgo),
        this.getDaily30DaysRevenue(thirtyDaysAgo),
        this.getDaily30DaysBrands(thirtyDaysAgo),
        this.getMonthlyStats(new Date(now.getFullYear() - 1, now.getMonth(), 1))
      ]);

      // Procesar los datos
      
      // Business metrics
      const growthRate = newBrandsLastMonth > 0 
        ? ((newBrandsThisMonth - newBrandsLastMonth) / newBrandsLastMonth) * 100 
        : 0;

      const businessTypeDistribution: BusinessTypeDistribution[] = brandsByBusinessType.map(item => ({
        businessType: item.businessType || 'Sin categoría',
        count: item._count.businessType,
        percentage: (item._count.businessType / activeBrands) * 100
      }));

      const businessMetrics: BusinessMetrics = {
        totalBrands,
        activeBrands,
        newBrandsThisMonth,
        newBrandsLastMonth,
        growthRate: Math.round(growthRate * 100) / 100,
        distributionByBusinessType: businessTypeDistribution
      };

      // Appointment metrics
      const totalAppointmentsCount = totalAppointments;
      const confirmedAndCompleted = appointmentsByStatus
        .filter(item => ['CONFIRMED', 'COMPLETED'].includes(item.status))
        .reduce((sum, item) => sum + item._count.status, 0);
      
      const conversionRate = totalAppointmentsCount > 0 
        ? (confirmedAndCompleted / totalAppointmentsCount) * 100 
        : 0;

      const appointmentStatusCounts: AppointmentStatusCount[] = appointmentsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        percentage: (item._count.status / totalAppointmentsCount) * 100
      }));

      const appointmentMetrics: AppointmentMetrics = {
        total: totalAppointmentsCount,
        thisMonth: appointmentsThisMonth,
        lastMonth: appointmentsLastMonth,
        byStatus: appointmentStatusCounts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averagePerBrand: activeBrands > 0 ? Math.round((totalAppointmentsCount / activeBrands) * 100) / 100 : 0,
        totalRevenue: Number(appointmentRevenue._sum.price) || 0
      };

      // Revenue metrics
      const totalSubscriptionAmount = Number(subscriptionRevenue._sum.amount) || 0;
      const thisMonthPayments = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'completed',
          processedAt: { gte: startOfThisMonth }
        }
      });
      
      const lastMonthPayments = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'completed',
          processedAt: { 
            gte: startOfLastMonth,
            lt: startOfThisMonth
          }
        }
      });

      const thisMonthAmount = Number(thisMonthPayments._sum.amount) || 0;
      const lastMonthAmount = Number(lastMonthPayments._sum.amount) || 0;
      const revenueGrowthRate = lastMonthAmount > 0 
        ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 
        : 0;

      const paymentDistribution: PaymentStatusDistribution[] = paymentsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        amount: Number(item._sum.amount) || 0,
        percentage: totalSubscriptionAmount > 0 
          ? ((Number(item._sum.amount) || 0) / totalSubscriptionAmount) * 100 
          : 0
      }));

      const revenueMetrics: RevenueMetrics = {
        totalSubscriptionRevenue: totalSubscriptionAmount,
        monthlyRecurringRevenue: thisMonthAmount,
        annualRecurringRevenue: thisMonthAmount * 12,
        thisMonthRevenue: thisMonthAmount,
        lastMonthRevenue: lastMonthAmount,
        revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,
        paymentDistribution,
        averageRevenuePerBrand: activeBrands > 0 ? Math.round((totalSubscriptionAmount / activeBrands) * 100) / 100 : 0
      };

      // User metrics
      const clientsWithMultiple = clientAppointmentStats.filter(stat => stat._count.clientId > 1).length;
      const totalClientAppointments = clientAppointmentStats.reduce((sum, stat) => sum + stat._count.clientId, 0);
      const avgAppointmentsPerClient = clientAppointmentStats.length > 0 
        ? totalClientAppointments / clientAppointmentStats.length 
        : 0;

      const userMetrics: UserMetrics = {
        totalUsers,
        totalClients,
        activeUsers,
        newUsersThisMonth,
        clientsWithMultipleAppointments: clientsWithMultiple,
        averageAppointmentsPerClient: Math.round(avgAppointmentsPerClient * 100) / 100,
        clientRetentionRate: totalClients > 0 ? (clientsWithMultiple / totalClients) * 100 : 0
      };

      // Activity metrics
      const topActivities: ActivityTypeCount[] = activitiesByType
        .sort((a, b) => b._count.type - a._count.type)
        .slice(0, 10)
        .map(item => ({
          type: item.type,
          count: item._count.type,
          percentage: (item._count.type / totalActivities) * 100
        }));

      const peakHours: HourActivityCount[] = activitiesByHour;

      const milestones: MilestoneCount[] = milestoneActivities.map(item => ({
        milestone: item.type,
        count: item._count.type
      }));

      const activityMetrics: ActivityMetrics = {
        totalActivities,
        thisMonthActivities: activitiesThisMonth,
        topActivities,
        peakActivityHours: peakHours,
        milestoneClients: milestones
      };

      // Trends metrics
      const dailyAppointmentTrends: DailyMetric[] = dailyAppointments;
      const dailyRevenueTrends: DailyMetric[] = dailyRevenue;
      const dailyBrandTrends: DailyMetric[] = dailyNewBrands;
      const monthlyTrends: MonthlyMetric[] = monthlyStats;

      const trendsMetrics: TrendsMetrics = {
        dailyAppointments: dailyAppointmentTrends,
        dailyRevenue: dailyRevenueTrends,
        dailyNewBrands: dailyBrandTrends,
        monthlyGrowth: monthlyTrends
      };

      const dashboardMetrics: DashboardMetricsDto = {
        business: businessMetrics,
        appointments: appointmentMetrics,
        revenue: revenueMetrics,
        users: userMetrics,
        activity: activityMetrics,
        trends: trendsMetrics
      };

      return BaseResponseDto.success(dashboardMetrics);

    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async getDaily30DaysAppointments(startDate: Date): Promise<DailyMetric[]> {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        }
      });

      // Agrupar por día
      const dailyCount = new Map<string, number>();
      appointments.forEach(apt => {
        const date = apt.createdAt.toISOString().split('T')[0];
        dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
      });

      return Array.from(dailyCount.entries()).map(([date, value]) => ({
        date,
        value
      })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting daily appointments:', error);
      return [];
    }
  }

  private async getDaily30DaysRevenue(startDate: Date): Promise<DailyMetric[]> {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          processedAt: { gte: startDate },
          status: 'completed'
        },
        select: {
          processedAt: true,
          amount: true
        }
      });

      // Agrupar por día
      const dailyRevenue = new Map<string, number>();
      payments.forEach(payment => {
        if (payment.processedAt) {
          const date = payment.processedAt.toISOString().split('T')[0];
          dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + Number(payment.amount));
        }
      });

      return Array.from(dailyRevenue.entries()).map(([date, value]) => ({
        date,
        value
      })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting daily revenue:', error);
      return [];
    }
  }

  private async getDaily30DaysBrands(startDate: Date): Promise<DailyMetric[]> {
    try {
      const brands = await this.prisma.brand.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        }
      });

      // Agrupar por día
      const dailyCount = new Map<string, number>();
      brands.forEach(brand => {
        const date = brand.createdAt.toISOString().split('T')[0];
        dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
      });

      return Array.from(dailyCount.entries()).map(([date, value]) => ({
        date,
        value
      })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting daily brands:', error);
      return [];
    }
  }

  private async getMonthlyStats(startDate: Date): Promise<MonthlyMetric[]> {
    try {
      // Obtener datos de los últimos 12 meses
      const brands = await this.prisma.brand.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          id: true
        }
      });

      const appointments = await this.prisma.appointment.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          brandId: true
        }
      });

      const payments = await this.prisma.payment.findMany({
        where: {
          processedAt: { gte: startDate },
          status: 'completed'
        },
        select: {
          processedAt: true,
          amount: true
        }
      });

      // Agrupar por mes
      const monthlyData = new Map<string, { brands: number, appointments: number, revenue: number }>();

      // Procesar marcas
      brands.forEach(brand => {
        const month = brand.createdAt.toISOString().substr(0, 7); // YYYY-MM
        if (!monthlyData.has(month)) {
          monthlyData.set(month, { brands: 0, appointments: 0, revenue: 0 });
        }
        monthlyData.get(month)!.brands += 1;
      });

      // Procesar citas
      appointments.forEach(appointment => {
        const month = appointment.createdAt.toISOString().substr(0, 7); // YYYY-MM
        if (!monthlyData.has(month)) {
          monthlyData.set(month, { brands: 0, appointments: 0, revenue: 0 });
        }
        monthlyData.get(month)!.appointments += 1;
      });

      // Procesar pagos
      payments.forEach(payment => {
        if (payment.processedAt) {
          const month = payment.processedAt.toISOString().substr(0, 7); // YYYY-MM
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { brands: 0, appointments: 0, revenue: 0 });
          }
          monthlyData.get(month)!.revenue += Number(payment.amount);
        }
      });

      return Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        brands: data.brands,
        appointments: data.appointments,
        revenue: data.revenue
      })).sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      return [];
    }
  }

  private async getActivityByHour(startDate: Date): Promise<HourActivityCount[]> {
    try {
      const activities = await this.prisma.clientActivity.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        }
      });

      // Agrupar por hora
      const hourlyCount = new Map<number, number>();
      activities.forEach(activity => {
        const hour = activity.createdAt.getHours();
        hourlyCount.set(hour, (hourlyCount.get(hour) || 0) + 1);
      });

      // Crear array con todas las horas (0-23)
      const result: HourActivityCount[] = [];
      for (let hour = 0; hour < 24; hour++) {
        result.push({
          hour,
          count: hourlyCount.get(hour) || 0
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting activity by hour:', error);
      return [];
    }
  }

  async getBrandDashboardMetrics(brandId: number): Promise<BaseResponseDto<BrandDashboardMetricsDto>> {
    try {
      // Verificar que la marca existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId }
      });

      if (!brand) {
        return BaseResponseDto.singleError(404, `Brand with ID ${brandId} not found`);
      }

      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Ejecutar consultas básicas en paralelo - solo datos que sabemos que existen
      const [
        totalAppointments,
        appointmentsThisMonth,
        appointmentsLastMonth,
        appointmentsByStatus,
        avgDuration,
        appointmentRevenue,
        totalClients,
        newClientsThisMonth,
        newClientsLastMonth,
        totalActivities,
        activitiesThisMonth
      ] = await Promise.all([
        // Consultas de citas - campos que sabemos que existen
        this.prisma.appointment.count({ where: { brandId } }),
        this.prisma.appointment.count({
          where: { brandId, createdAt: { gte: startOfThisMonth } }
        }),
        this.prisma.appointment.count({
          where: { 
            brandId, 
            createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } 
          }
        }),
        this.prisma.appointment.groupBy({
          by: ['status'],
          _count: { status: true },
          where: { brandId }
        }),
        this.prisma.appointment.aggregate({
          _avg: { duration: true },
          where: { brandId }
        }),
        this.prisma.appointment.aggregate({
          _sum: { price: true },
          where: { brandId, price: { not: null } }
        }),
        
        // Consultas de clientes - usando UserBrand que sabemos que existe
        this.prisma.userBrand.count({ where: { brandId } }),
        this.prisma.userBrand.count({
          where: { brandId, createdAt: { gte: startOfThisMonth } }
        }),
        this.prisma.userBrand.count({
          where: { 
            brandId, 
            createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } 
          }
        }),

        // Consultas de actividad - solo si existen ClientActivity
        this.prisma.clientActivity.count({ where: { brandId } }),
        this.prisma.clientActivity.count({
          where: { brandId, createdAt: { gte: startOfThisMonth } }
        })
      ]);

      // Procesar información básica de la marca
      const daysSinceCreation = Math.floor((now.getTime() - brand.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const brandInfo: BrandInfo = {
        id: brand.id,
        name: brand.name,
        businessType: brand.businessType || 'Sin categoría',
        isActive: brand.isActive,
        createdAt: brand.createdAt.toISOString(),
        daysSinceCreation
      };

      // Métricas de citas
      const appointmentGrowthRate = appointmentsLastMonth > 0 
        ? ((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth) * 100 
        : 0;

      const appointmentStatusCounts: AppointmentStatusCount[] = appointmentsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        percentage: totalAppointments > 0 ? (item._count.status / totalAppointments) * 100 : 0
      }));

      const brandAppointmentMetrics: BrandAppointmentMetrics = {
        total: totalAppointments,
        thisMonth: appointmentsThisMonth,
        lastMonth: appointmentsLastMonth,
        growthRate: Math.round(appointmentGrowthRate * 100) / 100,
        byStatus: appointmentStatusCounts,
        avgDuration: Number(avgDuration._avg.duration) || 0,
        totalRevenue: Number(appointmentRevenue._sum.price) || 0
      };

      // Métricas de clientes
      const clientGrowthRate = newClientsLastMonth > 0 
        ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100 
        : 0;

      const brandClientMetrics: BrandClientMetrics = {
        totalClients,
        newClientsThisMonth,
        newClientsLastMonth,
        clientGrowthRate: Math.round(clientGrowthRate * 100) / 100
      };

      // Métricas de revenue
      const thisMonthRevenue = await this.prisma.appointment.aggregate({
        _sum: { price: true },
        where: { 
          brandId, 
          price: { not: null },
          createdAt: { gte: startOfThisMonth }
        }
      });

      const lastMonthRevenue = await this.prisma.appointment.aggregate({
        _sum: { price: true },
        where: { 
          brandId, 
          price: { not: null },
          createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }
        }
      });

      const thisMonthAmount = Number(thisMonthRevenue._sum.price) || 0;
      const lastMonthAmount = Number(lastMonthRevenue._sum.price) || 0;
      const revenueGrowthRate = lastMonthAmount > 0 
        ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 
        : 0;

      const totalRevenueAmount = Number(appointmentRevenue._sum.price) || 0;
      const averagePerAppointment = totalAppointments > 0 ? totalRevenueAmount / totalAppointments : 0;

      const brandRevenueMetrics: BrandRevenueMetrics = {
        totalRevenue: totalRevenueAmount,
        thisMonthRevenue: thisMonthAmount,
        lastMonthRevenue: lastMonthAmount,
        growthRate: Math.round(revenueGrowthRate * 100) / 100,
        averagePerAppointment: Math.round(averagePerAppointment * 100) / 100
      };

      // Métricas de actividad
      const brandActivityMetrics: BrandActivityMetrics = {
        totalActivities,
        thisMonthActivities: activitiesThisMonth
      };

      const dashboardMetrics: BrandDashboardMetricsDto = {
        brandInfo,
        appointments: brandAppointmentMetrics,
        clients: brandClientMetrics,
        revenue: brandRevenueMetrics,
        activity: brandActivityMetrics
      };

      return BaseResponseDto.success(dashboardMetrics);

    } catch (error) {
      console.error('Error getting brand dashboard metrics:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }


}

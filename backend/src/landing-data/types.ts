export interface BusinessTypeDto {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  order: number;
  recommendedFeatures?: FeatureDto[];
}

export interface FeatureDto {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED';
  isRecommended: boolean;
  isPopular: boolean;
  order: number;
  businessTypes: string[];
}

export interface PlanDto {
  id: number;
  type: 'web' | 'app' | 'complete';
  name: string;
  description?: string;
  basePrice: number;
}

export interface LandingConfigDto {
  businessTypes: BusinessTypeDto[];
  features: FeatureDto[];
  plans: PlanDto[];
}

export interface DashboardMetricsDto {
  business: BusinessMetrics;
  appointments: AppointmentMetrics;
  revenue: RevenueMetrics;
  users: UserMetrics;
  activity: ActivityMetrics;
  trends: TrendsMetrics;
}

export interface BrandDashboardMetricsDto {
  brandInfo: BrandInfo;
  appointments: BrandAppointmentMetrics;
  clients: BrandClientMetrics;
  revenue: BrandRevenueMetrics;
  activity: BrandActivityMetrics;
}

export interface BusinessMetrics {
  totalBrands: number;
  activeBrands: number;
  newBrandsThisMonth: number;
  newBrandsLastMonth: number;
  growthRate: number; // % de crecimiento mes a mes
  distributionByBusinessType: BusinessTypeDistribution[];
}

export interface BusinessTypeDistribution {
  businessType: string;
  count: number;
  percentage: number;
}

export interface AppointmentMetrics {
  total: number;
  thisMonth: number;
  lastMonth: number;
  byStatus: AppointmentStatusCount[];
  conversionRate: number; // (confirmed + completed) / total
  averagePerBrand: number;
  totalRevenue: number;
}

export interface AppointmentStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueMetrics {
  totalSubscriptionRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthRate: number;
  paymentDistribution: PaymentStatusDistribution[];
  averageRevenuePerBrand: number;
}

export interface PaymentStatusDistribution {
  status: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface UserMetrics {
  totalUsers: number;
  totalClients: number;
  activeUsers: number;
  newUsersThisMonth: number;
  clientsWithMultipleAppointments: number;
  averageAppointmentsPerClient: number;
  clientRetentionRate: number;
}

export interface ActivityMetrics {
  totalActivities: number;
  thisMonthActivities: number;
  topActivities: ActivityTypeCount[];
  peakActivityHours: HourActivityCount[];
  milestoneClients: MilestoneCount[];
}

export interface ActivityTypeCount {
  type: string;
  count: number;
  percentage: number;
}

export interface HourActivityCount {
  hour: number;
  count: number;
}

export interface MilestoneCount {
  milestone: string;
  count: number;
}

export interface TrendsMetrics {
  dailyAppointments: DailyMetric[];
  dailyRevenue: DailyMetric[];
  dailyNewBrands: DailyMetric[];
  monthlyGrowth: MonthlyMetric[];
}

export interface DailyMetric {
  date: string;
  value: number;
}

export interface MonthlyMetric {
  month: string;
  brands: number;
  appointments: number;
  revenue: number;
}

// Interfaces específicas para métricas por brand
export interface BrandInfo {
  id: number;
  name: string;
  businessType: string;
  isActive: boolean;
  createdAt: string;
  daysSinceCreation: number;
}

export interface BrandAppointmentMetrics {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  byStatus: AppointmentStatusCount[];
  avgDuration: number;
  totalRevenue: number;
}

export interface ServiceTypeMetric {
  name: string;
  count: number;
  revenue: number;
  avgDuration: number;
}

export interface BrandClientMetrics {
  totalClients: number;
  newClientsThisMonth: number;
  newClientsLastMonth: number;
  clientGrowthRate: number;
}

export interface TopClientMetric {
  id: number;
  name: string;
  appointmentCount: number;
  totalRevenue: number;
  lastVisit: string;
}

export interface BrandRevenueMetrics {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  growthRate: number;
  averagePerAppointment: number;
}

export interface ServiceRevenueMetric {
  serviceName: string;
  totalRevenue: number;
  appointmentCount: number;
  averagePrice: number;
}

export interface BrandActivityMetrics {
  totalActivities: number;
  thisMonthActivities: number;
}

export interface DayActivityCount {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

export interface BrandTrendsMetrics {
  dailyAppointments: DailyMetric[]; // últimos 30 días
  dailyRevenue: DailyMetric[]; // últimos 30 días
  monthlyAppointments: MonthlyBrandMetric[]; // últimos 12 meses
  monthlyRevenue: MonthlyBrandMetric[]; // últimos 12 meses
  monthlyClients: MonthlyBrandMetric[]; // últimos 12 meses
}

export interface MonthlyBrandMetric {
  month: string;
  appointments: number;
  revenue: number;
  clients: number;
}

export interface BrandPerformanceMetrics {
  appointmentEfficiency: number; // % de citas completadas vs programadas
  clientSatisfaction: number; // basado en repeat visits
  revenuePerHour: number;
  utilizationRate: number; // % de horario ocupado vs disponible
  cancellationRate: number;
  punctualityScore: number; // basado en citas a tiempo
}

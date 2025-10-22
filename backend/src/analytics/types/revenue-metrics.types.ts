/**
 * Tipos para las métricas de revenue analytics
 */

/**
 * Comparativa entre períodos
 */
export interface PeriodComparison {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number;
}

/**
 * Métricas de revenue diarias
 */
export interface DailyRevenueMetrics {
  today: number;
  yesterday: number;
  comparison: PeriodComparison;
  date: string;
}

/**
 * Métricas de revenue semanales
 */
export interface WeeklyRevenueMetrics {
  currentWeek: number;
  previousWeek: number;
  comparison: PeriodComparison;
  weekStartDate: string;
  weekEndDate: string;
}

/**
 * Métricas de revenue mensuales
 */
export interface MonthlyRevenueMetrics {
  currentMonth: number;
  previousMonth: number;
  comparison: PeriodComparison;
  month: string;
  year: number;
}

/**
 * Métricas de revenue anuales
 */
export interface AnnualRevenueMetrics {
  currentYear: number;
  previousYear: number;
  comparison: PeriodComparison;
  year: number;
}

/**
 * Desglose por fuente de ingresos
 */
export interface RevenueBreakdown {
  appointments: number; // Ingresos de citas (Appointment.price)
  services: number;     // Ingresos de servicios walk-in (Payment tipo SERVICE) - Futuro
  products: number;     // Ingresos de productos (Payment tipo PRODUCT) - Futuro
  total: number;        // Total de ingresos
}

/**
 * Costos operativos del brand
 */
export interface OperatingCosts {
  subscription: number; // Costo de suscripción a la plataforma (prorrateado según período)
}

/**
 * Métricas financieras completas
 */
export interface FinancialMetrics {
  revenue: RevenueBreakdown;
  costs: OperatingCosts;
  netRevenue: number; // Ganancia neta (revenue.total - costs.subscription)
}

/**
 * Métricas detalladas por período
 */
export interface DetailedPeriodMetrics {
  period: 'daily' | 'weekly' | 'monthly' | 'annual';
  breakdown: RevenueBreakdown;
  comparison: PeriodComparison;
  metadata: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
}

/**
 * Response completo del endpoint de revenue
 */
export interface RevenueAnalyticsResponse {
  brandId: number;
  brandName: string;
  currency: string;
  generatedAt: string;
  daily: DailyRevenueMetrics;
  weekly: WeeklyRevenueMetrics;
  monthly: MonthlyRevenueMetrics;
  annual: AnnualRevenueMetrics;
  breakdown: {
    daily: FinancialMetrics;
    weekly: FinancialMetrics;
    monthly: FinancialMetrics;
    annual: FinancialMetrics;
  };
}

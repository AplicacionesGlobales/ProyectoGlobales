// src/hooks/useOptimizedMonthlyCalendar.ts
// Hook para la vista mensual del calendario con optimizaciones para móviles

import { useState, useEffect, useCallback } from 'react';
import { getMonthlyCalendarData } from '@/api/endpoints';
import type { 
  CalendarConfiguration,
  CalendarLoadingState,
  CalendarError 
} from '@/types/calendar';

interface MonthlyCalendarData {
  month: string;
  summary: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalOccupiedMinutes: number;
    totalAvailableMinutes: number;
    averageOccupancyPercentage: number;
    businessDaysInMonth: number;
    daysWithAppointments: number;
  };
  days: Array<{
    date: string;
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalOccupiedMinutes: number;
    totalAvailableMinutes: number;
    occupancyPercentage: number;
    isBusinessOpen: boolean;
  }>;
}

interface UseMonthlyCalendarProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
}

interface UseMonthlyCalendarReturn {
  // Data
  currentMonth: string;
  monthData: MonthlyCalendarData | null;
  
  // UI State
  loading: CalendarLoadingState;
  error: CalendarError | null;
  isRefreshing: boolean;
  
  // Actions
  navigateToMonth: (month: string) => void;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToCurrentMonth: () => void;
  refreshData: () => Promise<void>;
  
  // Utilities
  formatMonthYear: (month: string) => string;
  getDayOccupancy: (date: string) => number;
  isBusinessOpen: (date: string) => boolean;
  getMonthSummary: () => MonthlyCalendarData['summary'] | null;
}

const DEFAULT_CONFIG: CalendarConfiguration = {
  brandId: 0,
  slotDuration: 30,
  showWeekends: true,
  timeFormat: '24h',
  firstDayOfWeek: 1,
  autoRefresh: true,
  refreshInterval: 60000, // 1 minuto para vista mensual
};

export const useOptimizedMonthlyCalendar = ({
  brandId,
  initialDate = new Date().toISOString().split('T')[0],
  config = {}
}: UseMonthlyCalendarProps): UseMonthlyCalendarReturn => {
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config, brandId };
  
  // Obtener mes inicial (YYYY-MM)
  const getMonthFromDate = (date: string): string => {
    return date.substring(0, 7); // YYYY-MM-DD -> YYYY-MM
  };

  // State management
  const [currentMonth, setCurrentMonth] = useState<string>(getMonthFromDate(initialDate));
  const [monthData, setMonthData] = useState<MonthlyCalendarData | null>(null);
  const [loading, setLoading] = useState<CalendarLoadingState>({
    appointments: false,
    slots: false,
    refresh: false
  });
  const [error, setError] = useState<CalendarError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch month data
  const fetchMonthData = useCallback(async (month: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(prev => ({ ...prev, appointments: true }));
      }
      setError(null);

      const response = await getMonthlyCalendarData(brandId, month);
      
      if (response.success && response.data) {
        setMonthData(response.data);
      } else {
        throw new Error('Failed to fetch monthly data');
      }
      
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError({
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load monthly calendar data',
        details: err
      });
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }));
      setIsRefreshing(false);
    }
  }, [brandId]);

  // Navigation actions
  const navigateToMonth = useCallback((month: string) => {
    setCurrentMonth(month);
  }, []);

  const navigateToPreviousMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month - 2 porque es 0-indexed
    const prevMonth = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setCurrentMonth(prevMonth);
  }, [currentMonth]);

  const navigateToNextMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1); // month porque es 0-indexed
    const nextMonth = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setCurrentMonth(nextMonth);
  }, [currentMonth]);

  const navigateToCurrentMonth = useCallback(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    setCurrentMonth(currentMonth);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchMonthData(currentMonth, true);
  }, [fetchMonthData, currentMonth]);

  // Utility functions
  const formatMonthYear = useCallback((month: string): string => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const getDayOccupancy = useCallback((date: string): number => {
    if (!monthData) return 0;
    const dayData = monthData.days.find(d => d.date === date);
    return dayData?.occupancyPercentage || 0;
  }, [monthData]);

  const isBusinessOpen = useCallback((date: string): boolean => {
    if (!monthData) return true;
    const dayData = monthData.days.find(d => d.date === date);
    return dayData?.isBusinessOpen ?? true;
  }, [monthData]);

  const getMonthSummary = useCallback((): MonthlyCalendarData['summary'] | null => {
    return monthData?.summary || null;
  }, [monthData]);

  // Effect: Load data when month changes
  useEffect(() => {
    fetchMonthData(currentMonth);
  }, [currentMonth, fetchMonthData]);

  // Effect: Auto-refresh if current month
  useEffect(() => {
    if (!finalConfig.autoRefresh) return;

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (currentMonth !== currentMonthStr) return;

    const interval = setInterval(() => {
      if (!loading.appointments && !isRefreshing) {
        refreshData();
      }
    }, finalConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [finalConfig.autoRefresh, finalConfig.refreshInterval, currentMonth, loading, isRefreshing, refreshData]);

  return {
    // Data
    currentMonth,
    monthData,
    
    // UI State
    loading,
    error,
    isRefreshing,
    
    // Actions
    navigateToMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToCurrentMonth,
    refreshData,
    
    // Utilities
    formatMonthYear,
    getDayOccupancy,
    isBusinessOpen,
    getMonthSummary,
  };
};
// src/hooks/useOptimizedWeeklyCalendar.ts
// Principio de Responsabilidad Única (SRP)
// Hook específico para la vista semanal del calendario, optimizado para móviles

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCalendarServices } from './useCalendarServices';
import type { 
  CalendarWeek, 
  CalendarDay,
  CalendarAppointment, 
  CalendarConfiguration,
  CalendarLoadingState,
  CalendarError 
} from '@/types/calendar';

interface UseWeeklyCalendarProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
}

interface UseWeeklyCalendarReturn {
  // Data
  currentWeekStart: string;
  weekData: CalendarWeek | null;
  weekDays: CalendarDay[];
  allAppointments: CalendarAppointment[];
  timeSlots: string[];
  
  // UI State
  loading: CalendarLoadingState;
  error: CalendarError | null;
  isRefreshing: boolean;
  
  // Actions
  navigateToWeek: (date: string) => void;
  navigateToPreviousWeek: () => void;
  navigateToNextWeek: () => void;
  navigateToCurrentWeek: () => void;
  refreshData: () => Promise<void>;
  
  // Utilities
  getDayAppointments: (date: string) => CalendarAppointment[];
  isTimeSlotAvailable: (date: string, time: string) => boolean;
  getAppointmentAtDateTime: (date: string, time: string) => CalendarAppointment | null;
  formatWeekRange: () => string;
  
  // Mobile optimizations
  getVisibleDays: () => CalendarDay[];
  shouldShowWeekend: () => boolean;
  getMobileViewConfig: () => { daysToShow: number; showAllDay: boolean };
}

const DEFAULT_CONFIG: CalendarConfiguration = {
  brandId: 0,
  slotDuration: 30,
  showWeekends: true,
  timeFormat: '24h',
  firstDayOfWeek: 1, // Monday
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
};

export const useOptimizedWeeklyCalendar = ({
  brandId,
  initialDate = new Date().toISOString().split('T')[0],
  config = {}
}: UseWeeklyCalendarProps): UseWeeklyCalendarReturn => {
  
  const { dataService, timeService, dateService } = useCalendarServices();
  const finalConfig = { ...DEFAULT_CONFIG, ...config, brandId };
  
  // State management
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => {
    const { start } = dateService.getWeekRange(initialDate, finalConfig.firstDayOfWeek);
    return start;
  });
  
  const [weekData, setWeekData] = useState<CalendarWeek | null>(null);
  const [loading, setLoading] = useState<CalendarLoadingState>({
    appointments: false,
    slots: false,
    refresh: false
  });
  const [error, setError] = useState<CalendarError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Memoized computed values
  const weekDays = useMemo(() => weekData?.days || [], [weekData]);
  
  const allAppointments = useMemo(() => {
    return weekDays.reduce<CalendarAppointment[]>((acc, day) => {
      return acc.concat(day.appointments);
    }, []);
  }, [weekDays]);
  
  // Generate time slots based on business hours (use first non-closed day)
  const timeSlots = useMemo(() => {
    const activeDay = weekDays.find(day => !day.businessHours.isClosed);
    if (!activeDay) return [];
    
    return timeService.generateTimeSlots(
      activeDay.businessHours.start,
      activeDay.businessHours.end,
      finalConfig.slotDuration
    );
  }, [weekDays, timeService, finalConfig.slotDuration]);

  // Mobile optimizations
  const getVisibleDays = useCallback((): CalendarDay[] => {
    if (finalConfig.showWeekends) {
      return weekDays;
    }
    
    // Filter out weekends (Saturday and Sunday)
    return weekDays.filter((day, index) => {
      if (finalConfig.firstDayOfWeek === 1) {
        // Monday is first day: Saturday(5), Sunday(6)
        return index < 5;
      } else {
        // Sunday is first day: Saturday(6)
        return index !== 6 && index !== 0;
      }
    });
  }, [weekDays, finalConfig.showWeekends, finalConfig.firstDayOfWeek]);

  const shouldShowWeekend = useCallback((): boolean => {
    return finalConfig.showWeekends;
  }, [finalConfig.showWeekends]);

  const getMobileViewConfig = useCallback(() => {
    const visibleDays = getVisibleDays();
    return {
      daysToShow: visibleDays.length <= 3 ? visibleDays.length : 3, // Max 3 days on mobile
      showAllDay: visibleDays.length <= 3
    };
  }, [getVisibleDays]);

  // Data fetching
  const fetchWeekData = useCallback(async (weekStart: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(prev => ({ ...prev, appointments: true, slots: true }));
      }
      setError(null);

      const data = await dataService.getWeekData(brandId, weekStart);
      setWeekData(data);
      
    } catch (err) {
      console.error('Error fetching week data:', err);
      setError({
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load calendar data',
        details: err
      });
    } finally {
      setLoading(prev => ({ ...prev, appointments: false, slots: false }));
      setIsRefreshing(false);
    }
  }, [brandId, dataService]);

  // Navigation actions
  const navigateToWeek = useCallback((date: string) => {
    const { start } = dateService.getWeekRange(date, finalConfig.firstDayOfWeek);
    setCurrentWeekStart(start);
  }, [dateService, finalConfig.firstDayOfWeek]);

  const navigateToPreviousWeek = useCallback(() => {
    const previousWeek = dateService.addWeeks(currentWeekStart, -1);
    setCurrentWeekStart(previousWeek);
  }, [currentWeekStart, dateService]);

  const navigateToNextWeek = useCallback(() => {
    const nextWeek = dateService.addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(nextWeek);
  }, [currentWeekStart, dateService]);

  const navigateToCurrentWeek = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const { start } = dateService.getWeekRange(today, finalConfig.firstDayOfWeek);
    setCurrentWeekStart(start);
  }, [dateService, finalConfig.firstDayOfWeek]);

  const refreshData = useCallback(async () => {
    await fetchWeekData(currentWeekStart, true);
  }, [fetchWeekData, currentWeekStart]);

  // Utility functions
  const getDayAppointments = useCallback((date: string): CalendarAppointment[] => {
    const day = weekDays.find(d => d.date === date);
    return day?.appointments || [];
  }, [weekDays]);

  const isTimeSlotAvailable = useCallback((date: string, time: string): boolean => {
    const dayAppointments = getDayAppointments(date);
    return timeService.isTimeSlotAvailable(time, dayAppointments);
  }, [getDayAppointments, timeService]);

  const getAppointmentAtDateTime = useCallback((date: string, time: string): CalendarAppointment | null => {
    const dayAppointments = getDayAppointments(date);
    const targetTime = new Date(`2000-01-01T${time}:00`);
    
    return dayAppointments.find(appointment => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      const appointmentStart = new Date(`2000-01-01T${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}:00`);
      const appointmentEnd = new Date(`2000-01-01T${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:00`);
      
      return targetTime >= appointmentStart && targetTime < appointmentEnd;
    }) || null;
  }, [getDayAppointments]);

  const formatWeekRange = useCallback((): string => {
    if (!weekData) return '';
    
    const startDate = dateService.formatDate(weekData.startDate, 'dd/MM');
    const endDate = dateService.formatDate(weekData.endDate, 'dd/MM');
    const month = dateService.formatDate(weekData.startDate, 'MMM yyyy');
    
    return `${startDate} - ${endDate} ${month}`;
  }, [weekData, dateService]);

  // Effect: Load data when week changes
  useEffect(() => {
    fetchWeekData(currentWeekStart);
  }, [currentWeekStart, fetchWeekData]);

  // Effect: Auto-refresh
  useEffect(() => {
    if (!finalConfig.autoRefresh) return;

    const interval = setInterval(() => {
      // Only auto-refresh if current week contains today and not currently loading
      const today = new Date().toISOString().split('T')[0];
      const weekDates = dateService.getCurrentWeekDates(currentWeekStart, finalConfig.firstDayOfWeek);
      const isCurrentWeek = weekDates.includes(today);
      
      if (isCurrentWeek && !loading.appointments && !loading.slots) {
        refreshData();
      }
    }, finalConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [finalConfig.autoRefresh, finalConfig.refreshInterval, currentWeekStart, dateService, loading, refreshData, finalConfig.firstDayOfWeek]);

  return {
    // Data
    currentWeekStart,
    weekData,
    weekDays,
    allAppointments,
    timeSlots,
    
    // UI State
    loading,
    error,
    isRefreshing,
    
    // Actions
    navigateToWeek,
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateToCurrentWeek,
    refreshData,
    
    // Utilities
    getDayAppointments,
    isTimeSlotAvailable,
    getAppointmentAtDateTime,
    formatWeekRange,
    
    // Mobile optimizations
    getVisibleDays,
    shouldShowWeekend,
    getMobileViewConfig,
  };
};

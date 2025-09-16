// src/hooks/useOptimizedDailyCalendar.ts
// Principio de Responsabilidad Única (SRP)
// Hook específico para la vista diaria del calendario, optimizado para móviles

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCalendarServices } from './useCalendarServices';
import type { 
  CalendarDay, 
  CalendarAppointment, 
  CalendarConfiguration,
  CalendarLoadingState,
  CalendarError,
  TimeSlot 
} from '@/types/calendar';

interface UseDailyCalendarProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
}

interface UseDailyCalendarReturn {
  // Data
  currentDate: string;
  dayData: CalendarDay | null;
  appointments: CalendarAppointment[];
  timeSlots: string[];
  availableSlots: TimeSlot[];
  
  // UI State
  loading: CalendarLoadingState;
  error: CalendarError | null;
  isRefreshing: boolean;
  
  // Actions
  navigateToDate: (date: string) => void;
  navigateToPreviousDay: () => void;
  navigateToNextDay: () => void;
  navigateToToday: () => void;
  refreshData: () => Promise<void>;
  
  // Utilities
  isTimeSlotAvailable: (time: string) => boolean;
  getAppointmentAtTime: (time: string) => CalendarAppointment | null;
  getCurrentTimePosition: () => number | null;
  formatTimeForDisplay: (time: string) => string;
  
  // Mobile optimizations
  getVisibleTimeRange: () => { start: string; end: string };
  shouldShowTimeSlot: (time: string) => boolean;
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

export const useOptimizedDailyCalendar = ({
  brandId,
  initialDate = new Date().toISOString().split('T')[0],
  config = {}
}: UseDailyCalendarProps): UseDailyCalendarReturn => {
  
  const { dataService, timeService, dateService } = useCalendarServices();
  const finalConfig = { ...DEFAULT_CONFIG, ...config, brandId };
  
  // State management
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [dayData, setDayData] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState<CalendarLoadingState>({
    appointments: false,
    slots: false,
    refresh: false
  });
  const [error, setError] = useState<CalendarError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Memoized computed values
  const appointments = useMemo(() => dayData?.appointments || [], [dayData]);
  const availableSlots = useMemo(() => dayData?.availableSlots || [], [dayData]);
  
  const timeSlots = useMemo(() => {
    if (!dayData?.businessHours || dayData.businessHours.isClosed) return [];
    
    return timeService.generateTimeSlots(
      dayData.businessHours.start,
      dayData.businessHours.end,
      finalConfig.slotDuration
    );
  }, [dayData?.businessHours, timeService, finalConfig.slotDuration]);

  // Mobile optimization: visible time range
  const getVisibleTimeRange = useCallback(() => {
    if (!dayData?.businessHours) {
      return { start: '09:00', end: '18:00' };
    }
    
    return timeService.getVisibleHoursForMobile(
      dayData.businessHours.start,
      dayData.businessHours.end
    );
  }, [dayData?.businessHours, timeService]);

  // Data fetching
  const fetchDayData = useCallback(async (date: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(prev => ({ ...prev, appointments: true, slots: true }));
      }
      setError(null);

      const data = await dataService.getDayData(brandId, date);
      setDayData(data);
      
    } catch (err) {
      console.error('Error fetching day data:', err);
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
  const navigateToDate = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  const navigateToPreviousDay = useCallback(() => {
    const previousDay = dateService.addDays(currentDate, -1);
    setCurrentDate(previousDay);
  }, [currentDate, dateService]);

  const navigateToNextDay = useCallback(() => {
    const nextDay = dateService.addDays(currentDate, 1);
    setCurrentDate(nextDay);
  }, [currentDate, dateService]);

  const navigateToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchDayData(currentDate, true);
  }, [fetchDayData, currentDate]);

  // Utility functions
  const isTimeSlotAvailable = useCallback((time: string) => {
    return timeService.isTimeSlotAvailable(time, appointments);
  }, [timeService, appointments]);

  const getAppointmentAtTime = useCallback((time: string): CalendarAppointment | null => {
    const targetTime = new Date(`2000-01-01T${time}:00`);
    
    return appointments.find(appointment => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      const appointmentStart = new Date(`2000-01-01T${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}:00`);
      const appointmentEnd = new Date(`2000-01-01T${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:00`);
      
      return targetTime >= appointmentStart && targetTime < appointmentEnd;
    }) || null;
  }, [appointments]);

  const getCurrentTimePosition = useCallback((): number | null => {
    if (!dayData?.businessHours || !dateService.isToday(currentDate)) {
      return null;
    }
    
    return timeService.getCurrentTimePosition(dayData.businessHours.start, 60); // 60px per hour
  }, [dayData?.businessHours, currentDate, dateService, timeService]);

  const formatTimeForDisplay = useCallback((time: string): string => {
    return timeService.formatTime(time, finalConfig.timeFormat);
  }, [timeService, finalConfig.timeFormat]);

  // Mobile optimization: determine if time slot should be visible
  const shouldShowTimeSlot = useCallback((time: string): boolean => {
    const visibleRange = getVisibleTimeRange();
    return time >= visibleRange.start && time <= visibleRange.end;
  }, [getVisibleTimeRange]);

  // Effect: Load data when date changes
  useEffect(() => {
    fetchDayData(currentDate);
  }, [currentDate, fetchDayData]);

  // Effect: Auto-refresh
  useEffect(() => {
    if (!finalConfig.autoRefresh) return;

    const interval = setInterval(() => {
      // Only auto-refresh if viewing today and not currently loading
      if (dateService.isToday(currentDate) && !loading.appointments && !loading.slots) {
        refreshData();
      }
    }, finalConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [finalConfig.autoRefresh, finalConfig.refreshInterval, currentDate, dateService, loading, refreshData]);

  return {
    // Data
    currentDate,
    dayData,
    appointments,
    timeSlots,
    availableSlots,
    
    // UI State  
    loading,
    error,
    isRefreshing,
    
    // Actions
    navigateToDate,
    navigateToPreviousDay,
    navigateToNextDay,
    navigateToToday,
    refreshData,
    
    // Utilities
    isTimeSlotAvailable,
    getAppointmentAtTime,
    getCurrentTimePosition,
    formatTimeForDisplay,
    
    // Mobile optimizations
    getVisibleTimeRange,
    shouldShowTimeSlot,
  };
};

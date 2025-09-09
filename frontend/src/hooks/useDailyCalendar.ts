// src/hooks/useDailyCalendar.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCalendarAppointments, getDayAgenda } from '@/api/endpoints';

// Define interfaces since they're not exported from types
interface Appointment {
  id: number;
  brandId: number;
  clientId: number;
  serviceTypeId?: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes?: string;
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceType?: {
    id: number;
    name: string;
    description?: string;
    duration: number;
    color?: string;
    icon?: string;
  };
}

interface BusinessHours {
  start: string;
  end: string;
  isClosed: boolean;
}

interface AgendaSlot {
  startTime: string;
  endTime: string;
  type: 'appointment' | 'available';
  duration: number;
  isBookable?: boolean;
  appointment?: Appointment;
}

interface DayAgenda {
  date: string;
  businessHours: BusinessHours;
  agenda: AgendaSlot[];
  totalAppointments: number;
  totalAvailableSlots: number;
  slotDuration: number;
  totalAvailableTime: number;
  totalBookedTime: number;
}

const AgendaSlotType = {
  APPOINTMENT: 'appointment' as const,
  AVAILABLE: 'available' as const
};

export interface UseDailyCalendarProps {
  brandId: number;
  date: string; // YYYY-MM-DD format
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface DailyCalendarData {
  appointments: Appointment[];
  businessHours: BusinessHours;
  agenda: AgendaSlot[];
  totalAppointments: number;
  totalAvailableSlots: number;
  slotDuration: number;
  totalAvailableTime: number;
  totalBookedTime: number;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export interface DailyCalendarActions {
  refreshData: () => Promise<void>;
  navigateToDate: (newDate: string) => void;
  navigateToPreviousDay: () => void;
  navigateToNextDay: () => void;
  navigateToToday: () => void;
  getTimeSlots: () => string[];
  getCurrentTimeSlot: () => string | null;
  isSlotAvailable: (timeSlot: string) => boolean;
  getAppointmentAtTime: (timeSlot: string) => Appointment | null;
  isCurrentTimeInBusinessHours: () => boolean;
}

// Helper function to add/subtract days from date string
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

// Helper function to get current time in HH:MM format
const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toTimeString().substring(0, 5);
};

// Helper function to get today's date in YYYY-MM-DD format
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to generate time slots from business hours
const generateTimeSlots = (start: string, end: string, slotDuration: number): string[] => {
  const slots: string[] = [];
  
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    slots.push(timeStr);
  }
  
  return slots;
};

export const useDailyCalendar = ({
  brandId,
  date: initialDate,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: UseDailyCalendarProps): DailyCalendarData & DailyCalendarActions => {
  // State management
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dayAgenda, setDayAgenda] = useState<DayAgenda | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Memoized business hours and agenda data
  const businessHours = useMemo(() => {
    return dayAgenda?.businessHours || {
      start: '09:00',
      end: '17:00',
      isClosed: true
    };
  }, [dayAgenda]);

  const agenda = useMemo(() => {
    return dayAgenda?.agenda || [];
  }, [dayAgenda]);

  const slotDuration = useMemo(() => {
    return dayAgenda?.slotDuration || 30;
  }, [dayAgenda]);

  // Generate time slots based on business hours
  const timeSlots = useMemo(() => {
    if (businessHours.isClosed) return [];
    return generateTimeSlots(businessHours.start, businessHours.end, slotDuration);
  }, [businessHours, slotDuration]);

  // Fetch day agenda and appointments
  const fetchDayData = useCallback(async (targetDate: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log(`📅 [DailyCalendar] Fetching data for date: ${targetDate}`);

      // Fetch day agenda (includes business hours and available slots)
      const agendaResponse = await getDayAgenda(brandId, targetDate);
      
      if (agendaResponse.success && agendaResponse.data) {
        setDayAgenda(agendaResponse.data);
        console.log(`✅ [DailyCalendar] Day agenda loaded:`, {
          date: targetDate,
          totalSlots: agendaResponse.data.agenda.length,
          appointments: agendaResponse.data.totalAppointments,
          availableSlots: agendaResponse.data.totalAvailableSlots,
          businessHours: agendaResponse.data.businessHours
        });
      } else {
        throw new Error('Failed to fetch day agenda');
      }

      // Fetch appointments for the day from calendar endpoint
      const appointmentsResponse = await getCalendarAppointments(
        brandId,
        targetDate,
        targetDate
      );
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        setAppointments(appointmentsResponse.data);
        console.log(`✅ [DailyCalendar] Appointments loaded: ${appointmentsResponse.data.length}`);
      } else {
        console.warn('⚠️ [DailyCalendar] Failed to fetch appointments, using agenda data');
        // Extract appointments from agenda if available
        const agendaAppointments = agendaResponse.data?.agenda
          .filter(slot => slot.type === AgendaSlotType.APPOINTMENT && slot.appointment)
          .map(slot => slot.appointment!)
          .filter(Boolean) || [];
        setAppointments(agendaAppointments);
      }

    } catch (err) {
      console.error('❌ [DailyCalendar] Error fetching day data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del día');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [brandId]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchDayData(currentDate, true);
  }, [fetchDayData, currentDate]);

  // Navigation functions
  const navigateToDate = useCallback((newDate: string) => {
    console.log(`🗓️ [DailyCalendar] Navigating to date: ${newDate}`);
    setCurrentDate(newDate);
  }, []);

  const navigateToPreviousDay = useCallback(() => {
    const previousDay = addDays(currentDate, -1);
    navigateToDate(previousDay);
  }, [currentDate, navigateToDate]);

  const navigateToNextDay = useCallback(() => {
    const nextDay = addDays(currentDate, 1);
    navigateToDate(nextDay);
  }, [currentDate, navigateToDate]);

  const navigateToToday = useCallback(() => {
    const today = getTodayString();
    navigateToDate(today);
  }, [navigateToDate]);

  // Utility functions
  const getCurrentTimeSlot = useCallback((): string | null => {
    const currentTime = getCurrentTimeString();
    const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
    
    // Find the time slot that contains the current time
    const slot = timeSlots.find(slot => {
      const slotMinutes = parseInt(slot.split(':')[0]) * 60 + parseInt(slot.split(':')[1]);
      return currentMinutes >= slotMinutes && currentMinutes < slotMinutes + slotDuration;
    });
    
    return slot || null;
  }, [timeSlots, slotDuration]);

  const isSlotAvailable = useCallback((timeSlot: string): boolean => {
    const availableSlot = agenda.find((slot: AgendaSlot) => 
      slot.startTime === timeSlot && 
      slot.type === AgendaSlotType.AVAILABLE &&
      slot.isBookable
    );
    return !!availableSlot;
  }, [agenda]);

  const getAppointmentAtTime = useCallback((timeSlot: string): Appointment | null => {
    const appointmentSlot = agenda.find((slot: AgendaSlot) => 
      slot.startTime === timeSlot && 
      slot.type === AgendaSlotType.APPOINTMENT
    );
    return appointmentSlot?.appointment || null;
  }, [agenda]);

  const isCurrentTimeInBusinessHours = useCallback((): boolean => {
    if (businessHours.isClosed) return false;
    
    const currentTime = getCurrentTimeString();
    return currentTime >= businessHours.start && currentTime <= businessHours.end;
  }, [businessHours]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      console.log('🔄 [DailyCalendar] Auto-refreshing data...');
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Effect to fetch data when date changes
  useEffect(() => {
    fetchDayData(currentDate);
  }, [currentDate, fetchDayData]);

  // Calculate statistics
  const totalAppointments = useMemo(() => dayAgenda?.totalAppointments || 0, [dayAgenda]);
  const totalAvailableSlots = useMemo(() => dayAgenda?.totalAvailableSlots || 0, [dayAgenda]);
  const totalAvailableTime = useMemo(() => dayAgenda?.totalAvailableTime || 0, [dayAgenda]);
  const totalBookedTime = useMemo(() => dayAgenda?.totalBookedTime || 0, [dayAgenda]);

  return {
    // Data
    appointments,
    businessHours,
    agenda,
    totalAppointments,
    totalAvailableSlots,
    slotDuration,
    totalAvailableTime,
    totalBookedTime,
    loading,
    error,
    refreshing,
    
    // Actions
    refreshData,
    navigateToDate,
    navigateToPreviousDay,
    navigateToNextDay,
    navigateToToday,
    getTimeSlots: () => timeSlots,
    getCurrentTimeSlot,
    isSlotAvailable,
    getAppointmentAtTime,
    isCurrentTimeInBusinessHours
  };
};

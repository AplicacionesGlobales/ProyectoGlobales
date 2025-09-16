import { useState, useCallback, useEffect } from 'react';
import { CalendarAppointment } from '@/components/ui/WeeklyCalendarView';
import { getCalendarAppointments, getDayAgenda } from '@/api/endpoints';

// Date utility functions
const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  if (format === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  return `${year}-${month}-${day}`;
};

const startOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const result = new Date(date);
  result.setDate(date.getDate() - diff);
  return result;
};

const endOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
  const start = startOfWeek(date, weekStartsOn);
  const result = new Date(start);
  result.setDate(start.getDate() + 6);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
};

// API functions - conectadas con el backend
const fetchCalendarAppointments = async (
  brandId: number,
  startDate: string,
  endDate: string
): Promise<CalendarAppointment[]> => {
  try {
    const response = await getCalendarAppointments(brandId, startDate, endDate);
    console.log('📅 Calendar appointments response:', response);
    
    if (response.success && response.data) {
      // El backend retorna BaseResponseDto.success(appointments) 
      // donde appointments es un array directo
      const appointmentsArray = Array.isArray(response.data) ? response.data : [];
      
      return appointmentsArray.map((apt: any) => ({
        id: apt.id,
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        client: apt.client,
        serviceType: apt.serviceType,
        notes: apt.notes,
      }));
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching calendar appointments:', error);
    return [];
  }
};

const fetchDayAgenda = async (
  brandId: number,
  date: string
): Promise<{
  businessHours: { start: string; end: string };
  appointments: CalendarAppointment[];
  availableSlots: { time: string; available: boolean }[];
}> => {
  try {
    console.log(`📋 Fetching day agenda for date: ${date}`);
    const response = await getDayAgenda(brandId, date);
    console.log('📋 Day agenda response:', response);
    
    if (response.success && response.data) {
      const { businessHours, agenda } = response.data;
      
      // Extraer slots disponibles de la agenda
      const availableSlots = agenda
        ? agenda
            .filter((slot: any) => slot.type === 'available')
            .map((slot: any) => ({
              time: slot.startTime,
              available: slot.isBookable !== false
            }))
        : [];
      
      return {
        businessHours: {
          start: businessHours?.start || '09:00',
          end: businessHours?.end || '18:00'
        },
        appointments: [], // Las citas ya se obtienen desde getCalendarAppointments
        availableSlots
      };
    }
    
    // Fallback si no hay respuesta exitosa
    console.warn(`⚠️ No data received for date ${date}, using defaults`);
    return {
      businessHours: { start: '09:00', end: '18:00' },
      appointments: [],
      availableSlots: []
    };
  } catch (error) {
    console.error(`❌ Error fetching day agenda for ${date}:`, error);
    // Fallback en caso de error
    return {
      businessHours: { start: '09:00', end: '18:00' },
      appointments: [],
      availableSlots: []
    };
  }
};

export interface UseWeeklyCalendarProps {
  brandId: number;
  initialDate?: Date;
  showWorkDaysOnly?: boolean;
}

export interface UseWeeklyCalendarReturn {
  // State
  currentWeek: Date;
  appointments: CalendarAppointment[];
  businessHours: { start: string; end: string };
  loading: boolean;
  error: string | null;
  showWorkDaysOnly: boolean;
  
  // Actions
  setCurrentWeek: (date: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  toggleViewMode: () => void;
  refreshData: () => Promise<void>;
  
  // Event handlers
  handleSlotPress: (date: Date, time: string) => void;
  handleAppointmentPress: (appointment: CalendarAppointment) => void;
  
  // Advanced features
  getBusinessHoursForDate: (date: Date) => Promise<{ start: string; end: string }>;
}

export const useWeeklyCalendar = ({
  brandId,
  initialDate = new Date(),
  showWorkDaysOnly = false,
}: UseWeeklyCalendarProps): UseWeeklyCalendarReturn => {
  // State
  const [currentWeek, setCurrentWeek] = useState(initialDate);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [businessHours, setBusinessHours] = useState({ start: '09:00', end: '18:00' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workDaysOnly, setWorkDaysOnly] = useState(showWorkDaysOnly);

  // Get week date range
  const getWeekRange = useCallback((date: Date) => {
    const start = startOfWeek(date, 0); // Sunday = 0
    const end = endOfWeek(date, 0);
    
    // If showing work days only, adjust the range
    if (workDaysOnly) {
      const workStart = addDays(start, 1); // Monday
      const workEnd = addDays(start, 5);   // Friday
      return {
        startDate: formatDate(workStart),
        endDate: formatDate(workEnd)
      };
    }
    
    return {
      startDate: formatDate(start),
      endDate: formatDate(end)
    };
  }, [workDaysOnly]);

  // Fetch appointments for the current week
  const fetchWeekAppointments = useCallback(async () => {
    if (!brandId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getWeekRange(currentWeek);
      console.log(`📅 Fetching appointments for week: ${startDate} to ${endDate}`);
      
      // Obtener citas de la semana
      const weekAppointments = await fetchCalendarAppointments(brandId, startDate, endDate);
      setAppointments(weekAppointments);
      
      // Obtener horarios de negocio del primer día de la semana como referencia
      // En el futuro se podría mejorar para obtener horarios de cada día
      const { startDate: firstDay } = getWeekRange(currentWeek);
      console.log(`📋 Fetching business hours for reference day: ${firstDay}`);
      
      const dayAgenda = await fetchDayAgenda(brandId, firstDay);
      setBusinessHours(dayAgenda.businessHours);
      
      console.log(`✅ Week data loaded successfully:`, {
        appointments: weekAppointments.length,
        businessHours: dayAgenda.businessHours
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las citas';
      setError(errorMessage);
      console.error('Error fetching weekly appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [brandId, currentWeek, getWeekRange]);

  // Load appointments when dependencies change
  useEffect(() => {
    fetchWeekAppointments();
  }, [fetchWeekAppointments]);

  // Navigation functions
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  const toggleViewMode = useCallback(() => {
    setWorkDaysOnly(prev => !prev);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchWeekAppointments();
  }, [fetchWeekAppointments]);

  // Event handlers
  const handleSlotPress = useCallback((date: Date, time: string) => {
    // Lógica para cuando se presiona un slot vacío
    console.log('Slot pressed:', { date: formatDate(date), time });
    
    // Aquí podrías abrir un modal para crear una cita
    // O navegar a una pantalla de creación de cita
    // onCreateAppointment?.(date, time);
  }, []);

  const handleAppointmentPress = useCallback((appointment: CalendarAppointment) => {
    // Lógica para cuando se presiona una cita existente
    console.log('Appointment pressed:', appointment);
    
    // Aquí podrías abrir un modal con detalles de la cita
    // O navegar a una pantalla de edición
    // onViewAppointment?.(appointment);
  }, []);

  // Advanced feature: Get business hours for a specific date
  const getBusinessHoursForDate = useCallback(async (date: Date): Promise<{ start: string; end: string }> => {
    try {
      const dateStr = formatDate(date);
      console.log(`📋 Getting business hours for specific date: ${dateStr}`);
      
      const dayAgenda = await fetchDayAgenda(brandId, dateStr);
      return dayAgenda.businessHours;
    } catch (error) {
      console.error(`❌ Error getting business hours for ${formatDate(date)}:`, error);
      // Return default hours on error
      return { start: '09:00', end: '18:00' };
    }
  }, [brandId]);

  return {
    // State
    currentWeek,
    appointments,
    businessHours,
    loading,
    error,
    showWorkDaysOnly: workDaysOnly,
    
    // Actions
    setCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    toggleViewMode,
    refreshData,
    
    // Event handlers
    handleSlotPress,
    handleAppointmentPress,
    
    // Advanced features
    getBusinessHoursForDate,
  };
};

export default useWeeklyCalendar;

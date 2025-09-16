// src/contexts/CalendarContext.tsx
// Context centralizado para manejar el estado del calendario
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getDayAgenda, 
  getMonthlyCalendarData, 
  getCalendarAppointments,
  getAppointmentsByDate,
  getAppointmentsByDateRange 
} from '@/api/endpoints';

export type CalendarViewType = 'day' | 'week' | 'month';

interface CalendarState {
  currentDate: string;
  currentView: CalendarViewType;
  brandId: number;
  dayData: any | null;
  monthData: any | null;
  weekData: any | null;
  loading: {
    day: boolean;
    week: boolean;
    month: boolean;
  };
  error: string | null;
}

type CalendarAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_VIEW'; payload: CalendarViewType }
  | { type: 'SET_BRAND_ID'; payload: number }
  | { type: 'SET_LOADING'; payload: { view: keyof CalendarState['loading']; loading: boolean } }
  | { type: 'SET_DAY_DATA'; payload: any }
  | { type: 'SET_MONTH_DATA'; payload: any }
  | { type: 'SET_WEEK_DATA'; payload: any }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_DATA' };

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, currentDate: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_BRAND_ID':
      return { ...state, brandId: action.payload };
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.view]: action.payload.loading }
      };
    case 'SET_DAY_DATA':
      return { ...state, dayData: action.payload };
    case 'SET_MONTH_DATA':
      return { ...state, monthData: action.payload };
    case 'SET_WEEK_DATA':
      return { ...state, weekData: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_DATA':
      return { ...state, dayData: null, monthData: null, weekData: null, error: null };
    default:
      return state;
  }
};

interface CalendarContextType {
  state: CalendarState;
  actions: {
    setDate: (date: string) => void;
    setView: (view: CalendarViewType) => void;
    setBrandId: (brandId: number) => void;
    navigateToToday: () => void;
    navigateToPreviousDay: () => void;
    navigateToNextDay: () => void;
    navigateToPreviousWeek: () => void;
    navigateToNextWeek: () => void;
    navigateToPreviousMonth: () => void;
    navigateToNextMonth: () => void;
    refreshCurrentView: () => Promise<void>;
  };
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: React.ReactNode;
  initialBrandId: number;
  initialDate?: string;
  initialView?: CalendarViewType;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
  initialBrandId,
  initialDate = new Date().toISOString().split('T')[0],
  initialView = 'day'
}) => {
  const [state, dispatch] = useReducer(calendarReducer, {
    currentDate: initialDate,
    currentView: initialView,
    brandId: initialBrandId,
    dayData: null,
    monthData: null,
    weekData: null,
    loading: { day: false, week: false, month: false },
    error: null
  });

  // Utility functions
  const addDays = (date: string, days: number): string => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const addWeeks = (date: string, weeks: number): string => {
    return addDays(date, weeks * 7);
  };

  const addMonths = (date: string, months: number): string => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const getWeekStart = (date: string): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  };

  const getMonthStart = (date: string): string => {
    return date.substring(0, 7); // YYYY-MM
  };

  // Data fetching functions
  const fetchDayData = async (date: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { view: 'day', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Usar el endpoint de agenda del día Y el endpoint de citas por fecha
      const [agendaResponse, appointmentsResponse] = await Promise.all([
        getDayAgenda(state.brandId, date).catch(() => null),
        getAppointmentsByDate(state.brandId, date).catch(() => null)
      ]);
      
      // Procesar datos de agenda
      let dayData: any = {
        date,
        businessHours: { start: '08:00', end: '18:00', isClosed: false },
        agenda: [] as any[],
        totalAppointments: 0,
        totalAvailableSlots: 0,
        slotDuration: 30,
        totalAvailableTime: 0,
        totalBookedTime: 0,
        appointments: [] as any[]
      };

      if (agendaResponse?.success && agendaResponse.data) {
        dayData = { ...agendaResponse.data, appointments: dayData.appointments };
      }

      // Integrar citas específicas del día
      if (appointmentsResponse?.success && appointmentsResponse.data) {
        dayData.appointments = appointmentsResponse.data;
        dayData.totalAppointments = appointmentsResponse.data.length;
      }

      dispatch({ type: 'SET_DAY_DATA', payload: dayData });
      
    } catch (error) {
      console.warn('Error loading day data:', error);
      // En caso de error, mostrar estructura vacía
      dispatch({ type: 'SET_DAY_DATA', payload: {
        date,
        businessHours: { start: '08:00', end: '18:00', isClosed: false },
        agenda: [] as any[],
        appointments: [] as any[],
        totalAppointments: 0,
        totalAvailableSlots: 0,
        slotDuration: 30,
        totalAvailableTime: 0,
        totalBookedTime: 0
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { view: 'day', loading: false } });
    }
  };

  const fetchWeekData = async (startDate: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { view: 'week', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const endDate = addDays(startDate, 6);
      
      // Usar el endpoint de appointments que sí funciona con rangos de fechas
      const response = await getAppointmentsByDateRange(state.brandId, startDate, endDate);
      
      if (response.success && response.data) {
        // Si viene la estructura con .appointments, extraer el array
        const appointments = response.data.appointments || response.data || [];
        dispatch({ type: 'SET_WEEK_DATA', payload: appointments });
      } else {
        dispatch({ type: 'SET_WEEK_DATA', payload: [] });
      }
    } catch (error) {
      console.warn('Error loading week data:', error);
      dispatch({ type: 'SET_WEEK_DATA', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { view: 'week', loading: false } });
    }
  };

  const fetchMonthData = async (month: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { view: 'month', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getMonthlyCalendarData(state.brandId, month);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_MONTH_DATA', payload: response.data });
      } else {
        // Estructura vacía para el mes
        dispatch({ type: 'SET_MONTH_DATA', payload: {
          month,
          summary: {
            totalAppointments: 0,
            confirmedAppointments: 0,
            pendingAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            totalOccupiedMinutes: 0,
            totalAvailableMinutes: 0,
            averageOccupancyPercentage: 0,
            businessDaysInMonth: 0,
            daysWithAppointments: 0
          },
          days: []
        }});
      }
    } catch (error) {
      console.warn('Error loading month data:', error);
      dispatch({ type: 'SET_MONTH_DATA', payload: {
        month,
        summary: {
          totalAppointments: 0,
          confirmedAppointments: 0,
          pendingAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          totalOccupiedMinutes: 0,
          totalAvailableMinutes: 0,
          averageOccupancyPercentage: 0,
          businessDaysInMonth: 0,
          daysWithAppointments: 0
        },
        days: []
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { view: 'month', loading: false } });
    }
  };

  // Actions
  const actions = {
    setDate: (date: string) => {
      dispatch({ type: 'SET_DATE', payload: date });
    },

    setView: (view: CalendarViewType) => {
      dispatch({ type: 'SET_VIEW', payload: view });
    },

    setBrandId: (brandId: number) => {
      dispatch({ type: 'SET_BRAND_ID', payload: brandId });
      dispatch({ type: 'CLEAR_DATA' });
    },

    navigateToToday: () => {
      const today = new Date().toISOString().split('T')[0];
      dispatch({ type: 'SET_DATE', payload: today });
    },

    navigateToPreviousDay: () => {
      const prevDay = addDays(state.currentDate, -1);
      dispatch({ type: 'SET_DATE', payload: prevDay });
    },

    navigateToNextDay: () => {
      const nextDay = addDays(state.currentDate, 1);
      dispatch({ type: 'SET_DATE', payload: nextDay });
    },

    navigateToPreviousWeek: () => {
      const prevWeek = addWeeks(state.currentDate, -1);
      dispatch({ type: 'SET_DATE', payload: prevWeek });
    },

    navigateToNextWeek: () => {
      const nextWeek = addWeeks(state.currentDate, 1);
      dispatch({ type: 'SET_DATE', payload: nextWeek });
    },

    navigateToPreviousMonth: () => {
      const prevMonth = addMonths(state.currentDate, -1);
      dispatch({ type: 'SET_DATE', payload: prevMonth });
    },

    navigateToNextMonth: () => {
      const nextMonth = addMonths(state.currentDate, 1);
      dispatch({ type: 'SET_DATE', payload: nextMonth });
    },

    refreshCurrentView: async () => {
      switch (state.currentView) {
        case 'day':
          await fetchDayData(state.currentDate);
          break;
        case 'week':
          await fetchWeekData(getWeekStart(state.currentDate));
          break;
        case 'month':
          await fetchMonthData(getMonthStart(state.currentDate));
          break;
      }
    }
  };

  // Effect: Load data when date or view changes
  useEffect(() => {
    switch (state.currentView) {
      case 'day':
        fetchDayData(state.currentDate);
        break;
      case 'week':
        fetchWeekData(getWeekStart(state.currentDate));
        break;
      case 'month':
        fetchMonthData(getMonthStart(state.currentDate));
        break;
    }
  }, [state.currentDate, state.currentView, state.brandId]);

  return (
    <CalendarContext.Provider value={{ state, actions }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
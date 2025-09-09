// src/types/calendar.ts
// Principio de Segregación de Interfaces (ISP)
// Cada interface tiene una responsabilidad específica

export interface CalendarAppointment {
  id: number;
  brandId: number;
  clientId: number;
  serviceTypeId?: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  duration: number;  // minutes
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  client?: CalendarClient;
  serviceType?: CalendarServiceType;
}

export interface CalendarClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CalendarServiceType {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  color?: string;
  icon?: string;
}

export interface BusinessHours {
  start: string; // "HH:MM" format
  end: string;   // "HH:MM" format  
  isClosed: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointment?: CalendarAppointment;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  businessHours: BusinessHours;
  appointments: CalendarAppointment[];
  availableSlots: TimeSlot[];
}

export interface CalendarWeek {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  days: CalendarDay[];
}

// Principio de Responsabilidad Única (SRP)
// Interfaces separadas para diferentes acciones
export interface CalendarInteractions {
  onSlotPress?: (date: string, time: string) => void;
  onAppointmentPress?: (appointment: CalendarAppointment) => void;
  onAppointmentMove?: (appointmentId: number, newDate: string, newTime: string) => Promise<boolean>;
}

export interface CalendarNavigation {
  onDateChange: (date: string) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
}

export interface CalendarConfiguration {
  brandId: number;
  slotDuration: number; // minutes (15, 30, 60)
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
}

// Types for calendar views
export type CalendarViewType = 'day' | 'week' | 'month';
export type AppointmentStatus = CalendarAppointment['status'];

// Error handling
export interface CalendarError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export interface CalendarLoadingState {
  appointments: boolean;
  slots: boolean;
  refresh: boolean;
}

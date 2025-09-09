// src/types/calendar.ts - Updated with new types for all views

// Existing types remain the same...
export interface CalendarAppointment {
  id: number;
  brandId: number;
  clientId: number;
  serviceTypeId?: number;
  startTime: string;
  endTime: string;
  duration: number;
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
  start: string;
  end: string;
  isClosed: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointment?: CalendarAppointment;
}

export interface CalendarDay {
  date: string;
  businessHours: BusinessHours;
  appointments: CalendarAppointment[];
  availableSlots: TimeSlot[];
}

export interface CalendarWeek {
  startDate: string;
  endDate: string;
  days: CalendarDay[];
}

// New types for enhanced business hours
export interface DetailedBusinessHours {
  id: number;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  dayName: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialHours {
  id: number;
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSettings {
  id: number;
  defaultDuration: number;
  bufferTime: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  allowSameDayBooking: boolean;
  createdAt: string;
  updatedAt: string;
}

// Monthly calendar specific types
export interface MonthlyDayData {
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
}

export interface MonthlySummary {
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
}

export interface CalendarMonth {
  month: string; // YYYY-MM format
  summary: MonthlySummary;
  days: MonthlyDayData[];
}

// Enhanced calendar configuration
export interface CalendarConfiguration {
  brandId: number;
  slotDuration: number;
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1;
  autoRefresh: boolean;
  refreshInterval: number;
  // New mobile-specific options
  mobileMaxDaysInWeek?: number;
  mobileCompactView?: boolean;
  enableSwipeNavigation?: boolean;
  showOccupancyIndicators?: boolean;
}

// Enhanced interactions
export interface CalendarInteractions {
  onSlotPress?: (date: string, time: string) => void;
  onAppointmentPress?: (appointment: CalendarAppointment) => void;
  onAppointmentMove?: (appointmentId: number, newDate: string, newTime: string) => Promise<boolean>;
  onDateSelect?: (date: string) => void; // For monthly view
  onWeekSelect?: (startDate: string) => void; // For future use
}

export interface CalendarNavigation {
  onDateChange: (date: string) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
  onViewChange?: (view: CalendarViewType) => void;
}

// Enhanced view types
export type CalendarViewType = 'day' | 'week' | 'month';
export type AppointmentStatus = CalendarAppointment['status'];

// Enhanced error handling
export interface CalendarError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  view?: CalendarViewType;
}

// Enhanced loading states
export interface CalendarLoadingState {
  appointments: boolean;
  slots: boolean;
  refresh: boolean;
  businessHours?: boolean;
  settings?: boolean;
}

// Mobile optimization types
export interface MobileViewConfig {
  daysToShow: number;
  showAllDay: boolean;
  enableSwipe: boolean;
  compactHeader: boolean;
}

// Enhanced calendar data service interface
export interface CalendarDataContext {
  businessHours: DetailedBusinessHours[];
  specialHours: SpecialHours[];
  appointmentSettings: AppointmentSettings;
  lastRefresh: string;
}

// View state management
export interface CalendarViewState {
  currentView: CalendarViewType;
  currentDate: string;
  selectedDate?: string;
  viewPreferences: {
    [key in CalendarViewType]?: {
      timeFormat: '12h' | '24h';
      showWeekends: boolean;
      compactView: boolean;
    };
  };
}

// Performance optimization types
export interface CalendarCacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CalendarCache {
  days: Map<string, CalendarCacheEntry>;
  weeks: Map<string, CalendarCacheEntry>;
  months: Map<string, CalendarCacheEntry>;
  businessHours: CalendarCacheEntry | null;
  settings: CalendarCacheEntry | null;
}

// Analytics and insights types (for future use)
export interface CalendarInsights {
  busyHours: Array<{ hour: number; averageOccupancy: number }>;
  busyDays: Array<{ dayOfWeek: number; averageOccupancy: number }>;
  monthlyTrends: Array<{ month: string; totalAppointments: number; occupancyRate: number }>;
  upcomingBusyPeriods: Array<{ date: string; occupancyPercentage: number }>;
}

// Export all existing types and new ones
export type {
  // Existing exports...
  TimeSlot,
  CalendarDay,
  CalendarWeek,
  CalendarAppointment,
  CalendarClient,
  CalendarServiceType,
  BusinessHours,
  CalendarConfiguration,
  CalendarInteractions,
  CalendarNavigation,
  CalendarError,
  CalendarLoadingState,
  
  // New exports
  DetailedBusinessHours,
  SpecialHours,
  AppointmentSettings,
  MonthlyDayData,
  MonthlySummary,
  CalendarMonth,
  MobileViewConfig,
  CalendarDataContext,
  CalendarViewState,
  CalendarCacheEntry,
  CalendarCache,
  CalendarInsights
};
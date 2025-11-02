// types/appointments.types.ts

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface ClientAppointment {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSummary {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
}

export interface AppointmentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientAppointmentsResponse {
  appointments: ClientAppointment[];
  pagination: AppointmentPagination;
  summary: AppointmentSummary;
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
  period?: 'upcoming' | 'past' | 'today' | 'all';
  page?: number;
  limit?: number;
}

// Estados de UI
export interface ClientAppointmentsState {
  appointments: ClientAppointment[];
  filteredAppointments: ClientAppointment[];
  summary: AppointmentSummary;
  pagination: AppointmentPagination;
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  filters: AppointmentFilters;
  error: string | null;
}

// Acciones
export interface ClientAppointmentsActions {
  loadAppointments: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  loadMore: () => Promise<void>;
  updateFilters: (filters: Partial<AppointmentFilters>) => void;
  resetFilters: () => void;
  getAppointmentById: (id: number) => ClientAppointment | undefined;
}

// Utilidades para el frontend
export interface AppointmentDisplayData extends ClientAppointment {
  displayDate: string;
  displayTime: string;
  statusColor: string;
  statusText: string;
  isPast: boolean;
  isToday: boolean;
  isUpcoming: boolean;
}
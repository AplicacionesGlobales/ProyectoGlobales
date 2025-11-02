// types/dashboard.types.ts

export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfileResponse {
  success: boolean;
  data: ClientProfile;
  message: string;
}

export interface ServiceType {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // en minutos
  isActive: boolean;
  brandId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTypesResponse {
  data: ServiceType[];
}

// Reutilizamos las interfaces ya creadas para citas
export interface DashboardStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  upcomingAppointments: number;
  pastAppointments: number;
}

export interface RecentAppointment {
  id: number;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  serviceType: {
    id: number;
    name: string;
    price: number;
  };
  professional?: {
    id: number;
    name: string;
  };
}

export interface DashboardData {
  profile: ClientProfile;
  stats: DashboardStats;
  recentAppointments: RecentAppointment[];
  availableServices: ServiceType[];
  todayAppointments: RecentAppointment[];
}

// Estados de carga
export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

// Filtros para el dashboard
export interface DashboardFilters {
  period?: 'today' | 'week' | 'month' | 'all';
  appointmentStatus?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}
// services/clientDashboard.service.ts
import { getClientProfile, getClientAppointments, getServicesTypes } from '@/api/endpoints';
import { 
  ClientProfile,
  ServiceType,
  ClientAppointmentDto,
  ClientAppointmentSummary,
  ClientAppointmentsListResponse
} from '@/api/types';

// Interfaces para el dashboard (usando los tipos de la API)
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
  todayAppointments: RecentAppointment[];
  availableServices: ServiceType[];
}

class ClientDashboardService {
  // Obtener perfil del cliente usando API existente
  async getClientProfileData(brandId: number): Promise<ClientProfile> {
    try {
      console.log('📝 Obteniendo perfil del cliente para brandId:', brandId);
      const response = await getClientProfile(brandId);
      
      console.log('📝 Respuesta completa del perfil:', response);
      
      if (!response.success) {
        console.error('❌ Backend devolvió success: false:', {
          success: response.success,
          errors: response.errors,
          data: response.data,
          completeResponse: response
        });
        
        // Si hay errores específicos, mostrarlos
        if (response.errors && response.errors.length > 0) {
          const error = response.errors[0];
          throw new Error(`Error del backend: ${error.description}`);
        }
        
        throw new Error(`Error desconocido del backend. Success: ${response.success}`);
      }
      
      if (!response.data) {
        console.error('❌ No hay datos en la respuesta:', response);
        throw new Error('El backend no devolvió datos del perfil');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Error completo fetching client profile:', {
        error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        brandId
      });
      
      // Re-lanzar el error original para mantener la información
      if (error instanceof Error && error.message.includes('No se pudo obtener el perfil')) {
        throw error;
      }
      
      throw new Error(
        error instanceof Error 
          ? `Error del API: ${error.message}` 
          : 'Error desconocido al obtener el perfil del cliente'
      );
    }
  }

  // Obtener servicios disponibles usando API existente
  async getAvailableServices(brandId: number): Promise<ServiceType[]> {
    try {
      console.log('🛍️ Obteniendo servicios disponibles para brandId:', brandId);
      const response = await getServicesTypes(brandId);
      return response.data.filter(service => service.isActive);
    } catch (error) {
      console.error('Error fetching available services:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error al obtener los servicios disponibles'
      );
    }
  }

  // Obtener estadísticas y citas recientes usando API existente
  async getAppointmentStats(brandId: number): Promise<{
    stats: DashboardStats;
    recentAppointments: RecentAppointment[];
    todayAppointments: RecentAppointment[];
  }> {
    try {
      console.log('📊 Obteniendo estadísticas de citas para brandId:', brandId);
      
      // Obtener todas las citas para calcular estadísticas (máximo 50 por request)
      // Nota: Si el cliente tiene más de 50 citas, las estadísticas se basarán en las más recientes
      const allAppointmentsPromise = getClientAppointments(brandId, {
        period: 'all',
        limit: 50
      });

      // Obtener citas de hoy
      const today = new Date().toISOString().split('T')[0];
      const todayAppointmentsPromise = getClientAppointments(brandId, {
        startDate: today,
        endDate: today,
        limit: 20
      });

      // Obtener citas próximas
      const upcomingAppointmentsPromise = getClientAppointments(brandId, {
        period: 'upcoming',
        limit: 5
      });

      const [allAppointments, todayAppointments, upcomingAppointments] = await Promise.all([
        allAppointmentsPromise,
        todayAppointmentsPromise,
        upcomingAppointmentsPromise
      ]);

      // Validar respuestas
      if (!allAppointments.success || !allAppointments.data) {
        throw new Error('No se pudieron obtener todas las citas');
      }
      if (!todayAppointments.success || !todayAppointments.data) {
        throw new Error('No se pudieron obtener las citas de hoy');
      }
      if (!upcomingAppointments.success || !upcomingAppointments.data) {
        throw new Error('No se pudieron obtener las próximas citas');
      }

      // Calcular estadísticas
      const stats: DashboardStats = {
        totalAppointments: allAppointments.data.summary.totalAppointments,
        completedAppointments: allAppointments.data.summary.completedAppointments,
        cancelledAppointments: allAppointments.data.summary.cancelledAppointments,
        pendingAppointments: allAppointments.data.summary.pendingAppointments,
        upcomingAppointments: upcomingAppointments.data.summary.totalAppointments,
        pastAppointments: allAppointments.data.summary.totalAppointments - upcomingAppointments.data.summary.totalAppointments,
      };

      // Transformar citas a formato del dashboard
      const transformAppointment = (appointment: ClientAppointmentDto): RecentAppointment => ({
        id: appointment.id,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        status: appointment.status,
        serviceType: {
          id: appointment.serviceType.id,
          name: appointment.serviceType.name,
          price: appointment.price || appointment.serviceType.price,
        },
        professional: appointment.professional ? {
          id: appointment.professional.id,
          name: `${appointment.professional.firstName} ${appointment.professional.lastName}`,
        } : undefined,
      });

      return {
        stats,
        recentAppointments: upcomingAppointments.data.appointments.map(transformAppointment),
        todayAppointments: todayAppointments.data.appointments.map(transformAppointment),
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error al obtener las estadísticas de citas'
      );
    }
  }

  // Obtener todos los datos del dashboard
  async getDashboardData(brandId: number): Promise<DashboardData> {
    try {
      console.log('🏠 Obteniendo datos completos del dashboard para brandId:', brandId);
      
      const [profile, services, appointmentData] = await Promise.all([
        this.getClientProfileData(brandId),
        this.getAvailableServices(brandId),
        this.getAppointmentStats(brandId),
      ]);

      return {
        profile,
        availableServices: services,
        stats: appointmentData.stats,
        recentAppointments: appointmentData.recentAppointments,
        todayAppointments: appointmentData.todayAppointments,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error al obtener los datos del dashboard'
      );
    }
  }
}

export const clientDashboardService = new ClientDashboardService();
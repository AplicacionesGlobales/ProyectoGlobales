// services/appointmentsService.ts
import { apiClient, ApiResponse } from '../app/api/client';
import { API_ENDPOINTS } from '../app/api/config';

// Interfaces para Appointments
export interface Appointment {
  id: number;
  brandId: number;
  clientId: number;
  serviceId: number; // ID de la función/feature
  date: string; // Fecha en formato YYYY-MM-DD
  startTime: string; // Hora en formato HH:MM
  endTime: string; // Hora en formato HH:MM
  duration: number; // Duración en minutos
  status: AppointmentStatus;
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Datos relacionados
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  service: {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
  };
}

export interface CreateAppointmentData {
  clientId: number;
  serviceId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  notes?: string;
}

export interface UpdateAppointmentData {
  clientId?: number;
  serviceId?: number;
  date?: string;
  startTime?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentConflict {
  hasConflict: boolean;
  conflictingAppointments: Array<{
    id: number;
    startTime: string;
    endTime: string;
    clientName: string;
    serviceName: string;
  }>;
  suggestedTimes: string[];
}

export interface AvailableSlot {
  time: string; // HH:MM
  available: boolean;
  reason?: string;
}

export interface CalendarEvent extends Appointment {
  title: string;
  start: Date;
  end: Date;
  resource: {
    appointmentId: number;
    status: AppointmentStatus;
    clientName: string;
    serviceName: string;
  };
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Pendiente',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.IN_PROGRESS]: 'En Progreso',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.NO_SHOW]: 'No se presentó'
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'orange',
  [AppointmentStatus.CONFIRMED]: 'blue',
  [AppointmentStatus.IN_PROGRESS]: 'green',
  [AppointmentStatus.COMPLETED]: 'gray',
  [AppointmentStatus.CANCELLED]: 'red',
  [AppointmentStatus.NO_SHOW]: 'destructive'
};

class AppointmentsService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // ==================== CRUD OPERATIONS ====================

  // Obtener todas las citas
  async getAppointments(
    brandId: number,
    page: number = 1,
    limit: number = 50,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: AppointmentStatus;
      clientId?: number;
      serviceId?: number;
    }
  ): Promise<ApiResponse<Appointment[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.startDate ? { startDate: filters.startDate } : {}),
        ...(filters?.endDate ? { endDate: filters.endDate } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.clientId !== undefined ? { clientId: filters.clientId.toString() } : {}),
        ...(filters?.serviceId !== undefined ? { serviceId: filters.serviceId.toString() } : {})
      });

      console.log('🚀 Getting appointments:', { brandId, page, limit, filters });
      const response = await apiClient.get<Appointment[]>(
        `${API_ENDPOINTS.APPOINTMENTS.GET_ALL(brandId)}?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointments response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointments error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo citas'
          }
        ]
      };
    }
  }

  // Obtener cita por ID
  async getAppointment(brandId: number, appointmentId: number): Promise<ApiResponse<Appointment>> {
    try {
      console.log('🚀 Getting appointment:', { brandId, appointmentId });
      const response = await apiClient.get<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(brandId, appointmentId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo cita'
          }
        ]
      };
    }
  }

  // Crear nueva cita
  async createAppointment(brandId: number, data: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    try {
      console.log('🚀 Creating appointment:', { brandId, data });
      const response = await apiClient.post<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.CREATE(brandId),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment creation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_CREATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error creando cita'
          }
        ]
      };
    }
  }

  // Actualizar cita
  async updateAppointment(
    brandId: number, 
    appointmentId: number, 
    data: UpdateAppointmentData
  ): Promise<ApiResponse<Appointment>> {
    try {
      console.log('🚀 Updating appointment:', { brandId, appointmentId, data });
      const response = await apiClient.put<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.UPDATE(brandId, appointmentId),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando cita'
          }
        ]
      };
    }
  }

  // Eliminar cita
  async deleteAppointment(brandId: number, appointmentId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🚀 Deleting appointment:', { brandId, appointmentId });
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.APPOINTMENTS.DELETE(brandId, appointmentId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment deletion response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment deletion error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_DELETE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error eliminando cita'
          }
        ]
      };
    }
  }

  // ==================== STATUS MANAGEMENT ====================

  // Confirmar cita
  async confirmAppointment(brandId: number, appointmentId: number): Promise<ApiResponse<Appointment>> {
    try {
      console.log('🚀 Confirming appointment:', { brandId, appointmentId });
      const response = await apiClient.patch<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.CONFIRM(brandId, appointmentId),
        {},
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment confirmation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment confirmation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_CONFIRM_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error confirmando cita'
          }
        ]
      };
    }
  }

  // Cancelar cita
  async cancelAppointment(
    brandId: number, 
    appointmentId: number, 
    reason?: string
  ): Promise<ApiResponse<Appointment>> {
    try {
      console.log('🚀 Cancelling appointment:', { brandId, appointmentId, reason });
      const response = await apiClient.patch<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.CANCEL(brandId, appointmentId),
        { reason },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment cancellation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment cancellation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_CANCEL_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error cancelando cita'
          }
        ]
      };
    }
  }

  // Completar cita
  async completeAppointment(brandId: number, appointmentId: number): Promise<ApiResponse<Appointment>> {
    try {
      console.log('🚀 Completing appointment:', { brandId, appointmentId });
      const response = await apiClient.patch<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.COMPLETE(brandId, appointmentId),
        {},
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment completion response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment completion error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_COMPLETE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error completando cita'
          }
        ]
      };
    }
  }

  // ==================== CALENDAR VIEWS ====================

  // Obtener citas para calendario (rango de fechas)
  async getCalendarAppointments(
    brandId: number,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      console.log('🚀 Getting calendar appointments:', { brandId, startDate, endDate });
      const response = await apiClient.get<Appointment[]>(
        `${API_ENDPOINTS.APPOINTMENTS.GET_BY_DATE_RANGE(brandId)}?startDate=${startDate}&endDate=${endDate}`,
        { headers: this.getAuthHeaders() }
      );
      
      if (response.success && response.data) {
        // Convertir appointments a eventos de calendario
        const events: CalendarEvent[] = response.data.map(appointment => ({
          ...appointment,
          title: `${appointment.client.firstName} ${appointment.client.lastName} - ${appointment.service.title}`,
          start: new Date(`${appointment.date}T${appointment.startTime}:00`),
          end: new Date(`${appointment.date}T${appointment.endTime}:00`),
          resource: {
            appointmentId: appointment.id,
            status: appointment.status,
            clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
            serviceName: appointment.service.title
          }
        }));
        
        return {
          success: true,
          data: events
        };
      }
      
      console.log('✅ Calendar appointments response:', response);
      return response as ApiResponse<CalendarEvent[]>;
    } catch (error: any) {
      console.error('❌ Calendar appointments error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CALENDAR_APPOINTMENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo citas del calendario'
          }
        ]
      };
    }
  }

  // Obtener citas de un día específico
  async getDayAppointments(brandId: number, date: string): Promise<ApiResponse<Appointment[]>> {
    try {
      console.log('🚀 Getting day appointments:', { brandId, date });
      const response = await apiClient.get<Appointment[]>(
        API_ENDPOINTS.APPOINTMENTS.GET_BY_DATE(brandId, date),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Day appointments response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Day appointments error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'DAY_APPOINTMENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo citas del día'
          }
        ]
      };
    }
  }

  // ==================== AVAILABILITY & CONFLICTS ====================

  // Verificar conflictos
  async checkConflicts(
    brandId: number,
    date: string,
    startTime: string,
    duration: number,
    excludeAppointmentId?: number
  ): Promise<ApiResponse<AppointmentConflict>> {
    try {
      console.log('🚀 Checking conflicts:', { brandId, date, startTime, duration });
      const response = await apiClient.post<AppointmentConflict>(
        API_ENDPOINTS.APPOINTMENTS.CHECK_CONFLICTS(brandId),
        {
          date,
          startTime,
          duration,
          excludeAppointmentId
        },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Conflict check response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Conflict check error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CONFLICT_CHECK_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error verificando conflictos'
          }
        ]
      };
    }
  }

  // Obtener slots disponibles
  async getAvailableSlots(
    brandId: number,
    date: string,
    duration: number = 30
  ): Promise<ApiResponse<AvailableSlot[]>> {
    try {
      console.log('🚀 Getting available slots:', { brandId, date, duration });
      const response = await apiClient.get<AvailableSlot[]>(
        `${API_ENDPOINTS.APPOINTMENTS.GET_AVAILABILITY(brandId)}?date=${date}&duration=${duration}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Available slots response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Available slots error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'AVAILABLE_SLOTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo slots disponibles'
          }
        ]
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error' };
    }
  }
}

export const appointmentsService = new AppointmentsService();
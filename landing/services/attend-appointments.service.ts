// landing\services\attend-appointments.service.ts
import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api/constants';

// Tipos específicos para atender citas
export interface TodayAgendaItem {
  startTime: string;
  endTime: string;
  type: 'available' | 'appointment';
  duration: number;
  isBookable: boolean;
  appointment?: AttendAppointmentData;
}

export interface AttendAppointmentData {
  id: number;
  brandId: number;
  clientId: number;
  serviceTypeId?: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TodayAgendaResponse {
  date: string;
  businessHours: {
    start: string;
    end: string;
    isClosed: boolean;
  };
  agenda: TodayAgendaItem[];
  totalAppointments: number;
  totalAvailableSlots: number;
  slotDuration: number;
  totalAvailableTime: number;
  totalBookedTime: number;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  notes?: string;
}

export interface ClientNote {
  id: number;
  clientId: number;
  brandId: number;
  note: string;
  isPrivate: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateClientNoteRequest {
  note: string;
  isPrivate: boolean;
}

export interface ClientNotesResponse {
  notes: ClientNote[];
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

class AttendAppointmentsService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  }

  // Obtener agenda del día actual
  async getTodayAgenda(brandId: number, includeCancelled: boolean = true): Promise<ApiResponse<TodayAgendaResponse>> {
    try {
      console.log('🚀 Getting today agenda:', { brandId, includeCancelled });
      
      const endpoint = `/brand/${brandId}/calendar/today/agenda?includeCancelled=${includeCancelled}`;
      
      const response = await apiClient.get<TodayAgendaResponse>(
        endpoint,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Today agenda response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Today agenda error:', error);
      return {
        success: false,
        errors: [{
          code: 'AGENDA_ERROR',
          description: 'Error obteniendo agenda del día'
        }]
      };
    }
  }

  // Actualizar estado de cita
  async updateAppointmentStatus(
    brandId: number, 
    appointmentId: number, 
    data: UpdateAppointmentStatusRequest
  ): Promise<ApiResponse<AttendAppointmentData>> {
    try {
      console.log('🚀 Updating appointment status:', { brandId, appointmentId, data });
      
      const endpoint = `/brand/${brandId}/appointments/${appointmentId}/status`;
      
      const response = await apiClient.put<AttendAppointmentData>(
        endpoint,
        data,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Update status response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Update status error:', error);
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.success === false && errorData.errors) {
          return {
            success: false,
            errors: errorData.errors
          };
        }
        
        if (errorData.message) {
          const messages = Array.isArray(errorData.message) ? errorData.message : [errorData.message];
          return {
            success: false,
            errors: messages.map((msg: string) => ({
              code: 'VALIDATION_ERROR',
              description: msg
            }))
          };
        }
      }
      
      return {
        success: false,
        errors: [{
          code: 'UPDATE_STATUS_ERROR',
          description: 'Error actualizando estado de la cita'
        }]
      };
    }
  }

  // Obtener detalles de una cita específica
  async getAppointmentDetails(brandId: number, appointmentId: number): Promise<ApiResponse<AttendAppointmentData>> {
    try {
      console.log('🚀 Getting appointment details:', { brandId, appointmentId });
      
      const endpoint = `/brand/${brandId}/appointments/${appointmentId}`;
      
      const response = await apiClient.get<AttendAppointmentData>(
        endpoint,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Appointment details response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Appointment details error:', error);
      return {
        success: false,
        errors: [{
          code: 'APPOINTMENT_DETAILS_ERROR',
          description: 'Error obteniendo detalles de la cita'
        }]
      };
    }
  }

  // Cancelar cita (DELETE)
  async cancelAppointment(brandId: number, appointmentId: number): Promise<ApiResponse<AttendAppointmentData>> {
    try {
      console.log('🚀 Cancelling appointment:', { brandId, appointmentId });
      
      const endpoint = `/brand/${brandId}/appointments/${appointmentId}`;
      
      const response = await apiClient.delete<AttendAppointmentData>(
        endpoint,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Cancel appointment response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Cancel appointment error:', error);
      return {
        success: false,
        errors: [{
          code: 'CANCEL_APPOINTMENT_ERROR',
          description: 'Error cancelando la cita'
        }]
      };
    }
  }

  // Obtener notas del cliente
  async getClientNotes(brandId: number, clientId: number): Promise<ApiResponse<ClientNotesResponse>> {
    try {
      console.log('🚀 Getting client notes:', { brandId, clientId });
      
      const endpoint = `/brands/${brandId}/clients/${clientId}/notes`;
      
      const response = await apiClient.get<ClientNotesResponse>(
        endpoint,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client notes response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client notes error:', error);
      return {
        success: false,
        errors: [{
          code: 'CLIENT_NOTES_ERROR',
          description: 'Error obteniendo notas del cliente'
        }]
      };
    }
  }

  // Crear nota del cliente
  async createClientNote(
    brandId: number, 
    clientId: number, 
    data: CreateClientNoteRequest
  ): Promise<ApiResponse<ClientNote>> {
    try {
      console.log('🚀 Creating client note:', { brandId, clientId, data });
      
      const endpoint = `/brands/${brandId}/clients/${clientId}/notes`;
      
      const response = await apiClient.post<ClientNote>(
        endpoint,
        data,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Create note response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Create note error:', error);
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.success === false && errorData.errors) {
          return {
            success: false,
            errors: errorData.errors
          };
        }
        
        if (errorData.message) {
          const messages = Array.isArray(errorData.message) ? errorData.message : [errorData.message];
          return {
            success: false,
            errors: messages.map((msg: string) => ({
              code: 'VALIDATION_ERROR',
              description: msg
            }))
          };
        }
      }
      
      return {
        success: false,
        errors: [{
          code: 'CREATE_NOTE_ERROR',
          description: 'Error creando nota del cliente'
        }]
      };
    }
  }

  // Eliminar nota del cliente
  async deleteClientNote(brandId: number, clientId: number, noteId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🚀 Deleting client note:', { brandId, clientId, noteId });
      
      const endpoint = `/brands/${brandId}/clients/${clientId}/notes/${noteId}`;
      
      const response = await apiClient.delete<void>(
        endpoint,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Delete note response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Delete note error:', error);
      return {
        success: false,
        errors: [{
          code: 'DELETE_NOTE_ERROR',
          description: 'Error eliminando nota del cliente'
        }]
      };
    }
  }

  // Obtener las transiciones de estado válidas
  getValidStatusTransitions(currentStatus: AppointmentStatus): AppointmentStatus[] {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [
        AppointmentStatus.CONFIRMED, 
        AppointmentStatus.CANCELLED
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.IN_PROGRESS, 
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW
      ],
      [AppointmentStatus.IN_PROGRESS]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
      ],
      [AppointmentStatus.COMPLETED]: [], // Estado final
      [AppointmentStatus.CANCELLED]: [], // Estado final
      [AppointmentStatus.NO_SHOW]: []    // Estado final
    };

    return validTransitions[currentStatus] || [];
  }

  // Obtener texto legible para el estado
  getStatusText(status: AppointmentStatus): string {
    const statusTexts: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'Pendiente',
      [AppointmentStatus.CONFIRMED]: 'Confirmada',
      [AppointmentStatus.IN_PROGRESS]: 'En Progreso',
      [AppointmentStatus.COMPLETED]: 'Completada',
      [AppointmentStatus.CANCELLED]: 'Cancelada',
      [AppointmentStatus.NO_SHOW]: 'No se presentó'
    };

    return statusTexts[status] || status;
  }

  // Obtener color para el estado
  getStatusColor(status: AppointmentStatus): string {
    const statusColors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [AppointmentStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [AppointmentStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
      [AppointmentStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [AppointmentStatus.NO_SHOW]: 'bg-gray-100 text-gray-800'
    };

    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }
}

export const attendAppointmentsService = new AttendAppointmentsService();
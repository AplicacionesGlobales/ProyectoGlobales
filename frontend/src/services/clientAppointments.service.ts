// services/clientAppointments.service.ts

import { BASE_URL } from '../api/constants';
import { 
  ClientAppointmentsResponse, 
  AppointmentFilters,
  ClientAppointment 
} from '../types/appointments.types';
import { secureStorage } from '../utils/secureStorage';
import Constants from 'expo-constants';

const getBrandId = (): number => {
  const brandId = process.env.EXPO_PUBLIC_BRAND_ID || Constants.expoConfig?.extra?.brand_id;
  return parseInt(brandId);
};

class ClientAppointmentsService {
  private baseURL = BASE_URL;

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await secureStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Obtener historial de citas del cliente
   */
  async getClientAppointments(
    filters: AppointmentFilters = {}
  ): Promise<ClientAppointmentsResponse> {
    try {
      const brandId = getBrandId();
      console.log('🚀 Obteniendo citas del cliente...');
      console.log('📍 Brand ID:', brandId);
      console.log('🔍 Filtros:', filters);

      // Construir query parameters
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.period) params.append('period', filters.period);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${this.baseURL}/brands/${brandId}/profile/appointments${queryString ? `?${queryString}` : ''}`;
      
      console.log('📡 URL:', url);

      const headers = await this.getAuthHeaders();
      console.log('🔑 Headers:', { ...headers, Authorization: 'Bearer ***' });

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);

      if (!data.success) {
        throw new Error(data.errors?.[0]?.message || 'Error desconocido del servidor');
      }

      return data.data;
    } catch (error) {
      console.error('💥 Error en getClientAppointments:', error);
      throw error;
    }
  }

  /**
   * Formatear cita para mostrar en UI
   */
  formatAppointmentForDisplay(appointment: ClientAppointment) {
    const startDate = new Date(appointment.startTime);
    const now = new Date();
    
    return {
      ...appointment,
      displayDate: this.formatDate(startDate),
      displayTime: this.formatTime(startDate),
      statusColor: this.getStatusColor(appointment.status),
      statusText: this.getStatusText(appointment.status),
      isPast: startDate < now,
      isToday: this.isToday(startDate),
      isUpcoming: startDate > now,
    };
  }

  /**
   * Formatear fecha para mostrar
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (appointmentDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (appointmentDate.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else if (appointmentDate.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  /**
   * Formatear hora para mostrar
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Obtener color según el estado
   */
  private getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return '#10B981'; // green-500
      case 'CONFIRMED':
        return '#3B82F6'; // blue-500
      case 'PENDING':
        return '#F59E0B'; // amber-500
      case 'CANCELLED':
        return '#EF4444'; // red-500
      case 'NO_SHOW':
        return '#6B7280'; // gray-500
      case 'IN_PROGRESS':
        return '#8B5CF6'; // violet-500
      default:
        return '#6B7280';
    }
  }

  /**
   * Obtener texto del estado
   */
  private getStatusText(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Completada';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'No asistió';
      case 'IN_PROGRESS':
        return 'En progreso';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Verificar si una fecha es hoy
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}

export const clientAppointmentsService = new ClientAppointmentsService();
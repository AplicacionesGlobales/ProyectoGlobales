// services/scheduleService.ts
import { apiClient } from '../app/api/client';
import { API_ENDPOINTS } from '../app/api/config';

// Interfaces para Schedule
export interface BusinessHour {
  id: number;
  brandId: number;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  isOpen: boolean;
  openTime?: string; // Formato "HH:MM"
  closeTime?: string; // Formato "HH:MM"
  createdAt: string;
  updatedAt: string;
}

export interface SpecialHour {
  id: number;
  brandId: number;
  date: string; // Fecha en formato ISO
  isOpen: boolean;
  openTime?: string; // Formato "HH:MM"
  closeTime?: string; // Formato "HH:MM"
  reason?: string; // "Día festivo", "Vacaciones", etc.
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSettings {
  id: number;
  brandId: number;
  defaultDuration: number; // en minutos
  bufferTime: number; // en minutos
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  allowSameDayBooking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessHourData {
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface UpdateBusinessHourData {
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface CreateSpecialHourData {
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string;
  description?: string;
}

export interface UpdateSpecialHourData {
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string;
  description?: string;
}

export interface UpdateAppointmentSettingsData {
  defaultDuration?: number;
  bufferTime?: number;
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
  allowSameDayBooking?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    code: string;
    description: string;
  }>;
}

class ScheduleService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // ==================== BUSINESS HOURS ====================

  // Obtener todos los horarios de negocio
  async getBusinessHours(brandId: number): Promise<ApiResponse<BusinessHour[]>> {
    try {
      console.log('🚀 Getting business hours for brand:', brandId);
      const response = await apiClient.get<BusinessHour[]>(
        API_ENDPOINTS.SCHEDULE.GET_BUSINESS_HOURS(brandId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Business hours response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Business hours error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BUSINESS_HOURS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo horarios de negocio'
          }
        ]
      };
    }
  }

  // Crear o actualizar horarios de negocio (batch)
  async updateBusinessHours(brandId: number, hours: CreateBusinessHourData[]): Promise<ApiResponse<BusinessHour[]>> {
    try {
      console.log('🚀 Updating business hours:', { brandId, hours });
      const response = await apiClient.put<BusinessHour[]>(
        API_ENDPOINTS.SCHEDULE.UPDATE_BUSINESS_HOURS(brandId),
        { hours },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Business hours update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Business hours update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BUSINESS_HOURS_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando horarios de negocio'
          }
        ]
      };
    }
  }

  // Actualizar un día específico
  async updateBusinessHour(
    brandId: number, 
    dayOfWeek: number, 
    data: UpdateBusinessHourData
  ): Promise<ApiResponse<BusinessHour>> {
    try {
      console.log('🚀 Updating business hour:', { brandId, dayOfWeek, data });
      const response = await apiClient.put<BusinessHour>(
        API_ENDPOINTS.SCHEDULE.UPDATE_BUSINESS_HOUR(brandId, dayOfWeek),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Business hour update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Business hour update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BUSINESS_HOUR_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando horario del día'
          }
        ]
      };
    }
  }

  // ==================== SPECIAL HOURS ====================

  // Obtener horarios especiales
  async getSpecialHours(
    brandId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<ApiResponse<SpecialHour[]>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      console.log('🚀 Getting special hours:', { brandId, startDate, endDate });
      const response = await apiClient.get<SpecialHour[]>(
        `/brand/${brandId}/special-hours?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Special hours response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Special hours error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'SPECIAL_HOURS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo horarios especiales'
          }
        ]
      };
    }
  }

  // Crear horario especial
  async createSpecialHour(brandId: number, data: CreateSpecialHourData): Promise<ApiResponse<SpecialHour>> {
    try {
      console.log('🚀 Creating special hour:', { brandId, data });
      const response = await apiClient.post<SpecialHour>(
        `/brand/${brandId}/special-hours`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Special hour creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Special hour creation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'SPECIAL_HOUR_CREATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error creando horario especial'
          }
        ]
      };
    }
  }

  // Actualizar horario especial
  async updateSpecialHour(
    brandId: number, 
    specialHourId: number, 
    data: UpdateSpecialHourData
  ): Promise<ApiResponse<SpecialHour>> {
    try {
      console.log('🚀 Updating special hour:', { brandId, specialHourId, data });
      const response = await apiClient.put<SpecialHour>(
        `/brand/${brandId}/special-hours/${specialHourId}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Special hour update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Special hour update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'SPECIAL_HOUR_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando horario especial'
          }
        ]
      };
    }
  }

  // Eliminar horario especial
  async deleteSpecialHour(brandId: number, specialHourId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🚀 Deleting special hour:', { brandId, specialHourId });
      const response = await apiClient.delete<void>(
        `/brand/${brandId}/special-hours/${specialHourId}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Special hour deletion response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Special hour deletion error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'SPECIAL_HOUR_DELETE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error eliminando horario especial'
          }
        ]
      };
    }
  }

  // ==================== APPOINTMENT SETTINGS ====================

  // Obtener configuración de citas
  async getAppointmentSettings(brandId: number): Promise<ApiResponse<AppointmentSettings>> {
    try {
      console.log('🚀 Getting appointment settings for brand:', brandId);
      const response = await apiClient.get<AppointmentSettings>(
        `/brand/${brandId}/appointment-settings`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment settings response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment settings error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_SETTINGS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo configuración de citas'
          }
        ]
      };
    }
  }

  // Actualizar configuración de citas
  async updateAppointmentSettings(
    brandId: number, 
    data: UpdateAppointmentSettingsData
  ): Promise<ApiResponse<AppointmentSettings>> {
    try {
      console.log('🚀 Updating appointment settings:', { brandId, data });
      const response = await apiClient.put<AppointmentSettings>(
        `/brand/${brandId}/appointment-settings`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Appointment settings update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Appointment settings update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'APPOINTMENT_SETTINGS_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando configuración de citas'
          }
        ]
      };
    }
  }

  // ==================== UTILIDADES ====================

  // Validar si una fecha/hora está dentro de horarios de negocio
  async validateBusinessHours(
    brandId: number, 
    date: string, 
    time: string
  ): Promise<ApiResponse<{ isValid: boolean; reason?: string }>> {
    try {
      console.log('🚀 Validating business hours:', { brandId, date, time });
      const response = await apiClient.post<{ isValid: boolean; reason?: string }>(
        `/brand/${brandId}/validate-hours`,
        { date, time },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Validation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Validation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error validando horarios'
          }
        ]
      };
    }
  }

  // Obtener slots disponibles para una fecha
  async getAvailableSlots(
    brandId: number, 
    date: string, 
    duration?: number
  ): Promise<ApiResponse<string[]>> {
    try {
      const params = new URLSearchParams({ date });
      if (duration) params.append('duration', duration.toString());
      
      console.log('🚀 Getting available slots:', { brandId, date, duration });
      const response = await apiClient.get<string[]>(
        `/brand/${brandId}/available-slots?${params.toString()}`,
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
}

export const scheduleService = new ScheduleService();
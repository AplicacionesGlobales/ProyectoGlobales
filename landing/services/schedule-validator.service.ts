// landing\services\schedule-validator.service.ts
import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api/constants';

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

export interface CalendarAvailabilityCheck {
  isAvailable: boolean;
  message: string;
  date: string;
  time: string;
  reason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  hasConflicts: boolean;
  hasBusinessHourConflict: boolean;
  conflicts: ConflictInfo[];
  suggestions: string[];
  warnings: string[];
}

export interface ConflictInfo {
  id: number;
  startTime: string;
  endTime: string;
  clientName: string;
  type: 'overlap' | 'adjacent' | 'business_hours';
}

class ScheduleValidatorService {
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async getAppointmentSettings(brandId: number): Promise<ApiResponse<AppointmentSettings>> {
    try {
      return await apiClient.get<AppointmentSettings>(
        API_ENDPOINTS.SCHEDULE.GET_APPOINTMENT_SETTINGS(brandId),
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      return {
        success: false,
        errors: [{ code: 'SETTINGS_ERROR', description: 'Error obteniendo configuración' }]
      };
    }
  }

  async validateCalendarAvailability(brandId: number, date: string, time: string): Promise<ApiResponse<CalendarAvailabilityCheck>> {
    try {
      const params = new URLSearchParams({ date, time });
      const endpoint = `${API_ENDPOINTS.VALIDATION.CALENDAR_AVAILABLE(brandId)}?${params}`;
      
      return await apiClient.get<CalendarAvailabilityCheck>(endpoint, { headers: this.getAuthHeaders() });
    } catch (error) {
      return {
        success: false,
        errors: [{ code: 'AVAILABILITY_ERROR', description: 'Error validando disponibilidad' }]
      };
    }
  }

  async validateCompleteSchedule(brandId: number, date: string, time: string, serviceDuration?: number): Promise<ValidationResult> {
    try {
      const [settingsResponse, availabilityResponse] = await Promise.all([
        this.getAppointmentSettings(brandId),
        this.validateCalendarAvailability(brandId, date, time)
      ]);

      const duration = serviceDuration || 
        (settingsResponse.success && settingsResponse.data ? settingsResponse.data.defaultDuration : 30);

      const startDateTime = new Date(`${date}T${time}:00`);
      const isAvailable = availabilityResponse.success && availabilityResponse.data?.isAvailable;
      const reason = availabilityResponse.data?.reason;

      // Validaciones básicas
      const timeValidation = this.validateTime(startDateTime, settingsResponse.data);
      
      // Construir conflictos
      const conflicts: ConflictInfo[] = [];
      if (!isAvailable && reason) {
        conflicts.push({
          id: 0,
          startTime: startDateTime.toISOString(),
          endTime: new Date(startDateTime.getTime() + duration * 60000).toISOString(),
          clientName: reason,
          type: this.getConflictType(reason)
        });
      }

      return {
        isValid: Boolean(isAvailable && timeValidation.isValid),
        hasConflicts: conflicts.length > 0,
        hasBusinessHourConflict: Boolean(reason?.includes('Horario de atención')),
        conflicts,
        suggestions: [...timeValidation.suggestions, ...this.getSuggestions(reason, startDateTime)],
        warnings: timeValidation.warnings
      };

    } catch (error) {
      return {
        isValid: false,
        hasConflicts: false,
        hasBusinessHourConflict: false,
        conflicts: [],
        suggestions: ['Error validando horario'],
        warnings: []
      };
    }
  }

  private validateTime(startTime: Date, settings?: AppointmentSettings) {
    const now = new Date();
    const suggestions: string[] = [];
    const warnings: string[] = [];
    
    if (startTime < now) {
      suggestions.push('No se pueden crear citas en el pasado');
    }

    if (settings?.minAdvanceBookingHours) {
      const minTime = new Date(now.getTime() + settings.minAdvanceBookingHours * 60 * 60000);
      if (startTime < minTime && startTime > now) {
        suggestions.push(`Se requiere ${settings.minAdvanceBookingHours}h de anticipación`);
      }
    }

    const dayOfWeek = startTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      warnings.push('Cita en fin de semana');
    }
    
    return {
      isValid: startTime >= now && suggestions.length === 0,
      suggestions,
      warnings
    };
  }

  private getConflictType(reason: string): 'overlap' | 'adjacent' | 'business_hours' {
    if (reason.includes('Horario de atención')) return 'business_hours';
    if (reason.includes('ya reservado')) return 'overlap';
    return 'adjacent';
  }

  private getSuggestions(reason: string | undefined, time: Date): string[] {
    if (!reason || !reason.includes('ya reservado')) return [];
    
    const suggestions = ['Horarios alternativos:'];
    const before = new Date(time.getTime() - 30 * 60000);
    const after = new Date(time.getTime() + 30 * 60000);
    
    if (before.getHours() >= 8) {
      suggestions.push(`${before.getHours().toString().padStart(2, '0')}:${before.getMinutes().toString().padStart(2, '0')}`);
    }
    if (after.getHours() < 18) {
      suggestions.push(`${after.getHours().toString().padStart(2, '0')}:${after.getMinutes().toString().padStart(2, '0')}`);
    }
    
    return suggestions;
  }

  getReasonText(reason: string): string {
    if (reason.includes('ya reservado')) return 'Horario ocupado';
    if (reason.includes('Horario de atención')) return 'Fuera de horario';
    if (reason.includes('cerrado')) return 'Negocio cerrado';
    if (reason.includes('pasados')) return 'Fecha pasada';
    return reason;
  }
}

export const scheduleValidatorService = new ScheduleValidatorService();
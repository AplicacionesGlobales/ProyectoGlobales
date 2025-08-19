// src/appointments/utils/appointment.utils.ts
import { BadRequestException } from '@nestjs/common';

export class AppointmentUtils {
  /**
   * Valida si un horario está en formato HH:MM válido
   */
  static isValidTimeFormat(time: string): boolean {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  /**
   * Convierte un tiempo en formato HH:MM a minutos desde medianoche
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convierte minutos desde medianoche a formato HH:MM
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Valida que una hora de inicio sea anterior a la hora de fin
   */
  static validateTimeRange(startTime: string, endTime: string): boolean {
    return this.timeToMinutes(startTime) < this.timeToMinutes(endTime);
  }

  /**
   * Calcula la duración en minutos entre dos horas
   */
  static calculateDuration(startTime: string, endTime: string): number {
    return this.timeToMinutes(endTime) - this.timeToMinutes(startTime);
  }

  /**
   * Genera slots de tiempo disponibles para un rango dado
   */
  static generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    bufferTime: number = 0
  ): string[] {
    const slots: string[] = [];
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    const totalSlotTime = slotDuration + bufferTime;

    for (let current = startMinutes; current + slotDuration <= endMinutes; current += totalSlotTime) {
      slots.push(this.minutesToTime(current));
    }

    return slots;
  }

  /**
   * Verifica si una fecha está dentro del rango de reserva permitido
   */
  static isWithinBookingRange(
    appointmentDate: Date,
    minAdvanceHours: number,
    maxAdvanceDays: number,
    allowSameDay: boolean = true
  ): { isValid: boolean; reason?: string } {
    const now = new Date();
    const timeDiffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Verificar tiempo mínimo de anticipación
    if (timeDiffHours < minAdvanceHours) {
      return {
        isValid: false,
        reason: `Debe reservar con al menos ${minAdvanceHours} horas de anticipación`
      };
    }

    // Verificar tiempo máximo de anticipación
    const daysDiff = Math.ceil(timeDiffHours / 24);
    if (daysDiff > maxAdvanceDays) {
      return {
        isValid: false,
        reason: `No puede reservar con más de ${maxAdvanceDays} días de anticipación`
      };
    }

    // Verificar reservas del mismo día
    if (!allowSameDay && appointmentDate.toDateString() === now.toDateString()) {
      return {
        isValid: false,
        reason: 'No se permiten reservas para el mismo día'
      };
    }

    return { isValid: true };
  }

  /**
   * Formatea una fecha para mostrar en la interfaz
   */
  static formatAppointmentDate(date: Date, includeTime: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Calcula el número de días hábiles entre dos fechas
   */
  static getBusinessDaysBetween(startDate: Date, endDate: Date, excludeWeekends: boolean = true): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Obtiene el nombre del día de la semana en español
   */
  static getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  }

  /**
   * Valida los datos de entrada para crear una cita
   */
  static validateAppointmentData(data: {
    startTime: string;
    duration?: number;
    description?: string;
  }): void {
    // Validar fecha
    const startTime = new Date(data.startTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Fecha de inicio inválida');
    }

    // Validar que la fecha no sea en el pasado
    if (startTime <= new Date()) {
      throw new BadRequestException('La fecha de la cita debe ser en el futuro');
    }

    // Validar duración si se proporciona
    if (data.duration !== undefined) {
      if (data.duration < 15 || data.duration > 480) {
        throw new BadRequestException('La duración debe estar entre 15 y 480 minutos');
      }
    }

    // Validar descripción si se proporciona
    if (data.description !== undefined && data.description.length > 500) {
      throw new BadRequestException('La descripción no puede exceder 500 caracteres');
    }
  }

  /**
   * Detecta conflictos entre dos citas
   */
  static hasTimeConflict(
    appointment1: { startTime: Date; endTime: Date },
    appointment2: { startTime: Date; endTime: Date }
  ): boolean {
    return (
      appointment1.startTime < appointment2.endTime &&
      appointment1.endTime > appointment2.startTime
    );
  }

  /**
   * Genera un resumen de disponibilidad para una semana
   */
  static generateWeeklyAvailability(
    businessHours: Array<{ dayOfWeek: number; isOpen: boolean; openTime?: string; closeTime?: string }>,
    specialHours: Array<{ date: Date; isOpen: boolean; openTime?: string; closeTime?: string }>,
    existingAppointments: Array<{ startTime: Date; endTime: Date }>,
    startDate: Date,
    slotDuration: number = 30,
    bufferTime: number = 5
  ): Array<{ date: string; dayName: string; slots: Array<{ time: string; available: boolean }> }> {
    const weeklyAvailability: Array<{ date: string; dayName: string; slots: Array<{ time: string; available: boolean }> }> = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Buscar configuración de horario
      const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
      const specialHour = specialHours.find(sh => 
        sh.date.toISOString().split('T')[0] === dateStr
      );
      
      // Determinar si está abierto y horarios
      let isOpen = businessHour?.isOpen || false;
      let openTime = businessHour?.openTime;
      let closeTime = businessHour?.closeTime;
      
      if (specialHour) {
        isOpen = specialHour.isOpen;
        openTime = specialHour.openTime || openTime;
        closeTime = specialHour.closeTime || closeTime;
      }
      
      const slots: Array<{ time: string; available: boolean }> = [];
      
      if (isOpen && openTime && closeTime) {
        const timeSlots = this.generateTimeSlots(openTime, closeTime, slotDuration, bufferTime);
        
        for (const time of timeSlots) {
          const slotStart = new Date(`${dateStr}T${time}:00`);
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          
          // Verificar conflictos con citas existentes
          const hasConflict = existingAppointments.some(apt =>
            this.hasTimeConflict(
              { startTime: slotStart, endTime: slotEnd },
              { startTime: apt.startTime, endTime: apt.endTime }
            )
          );
          
          slots.push({
            time,
            available: !hasConflict
          });
        }
      }
      
      weeklyAvailability.push({
        date: dateStr,
        dayName: this.getDayName(dayOfWeek),
        slots
      });
    }
    
    return weeklyAvailability;
  }
}

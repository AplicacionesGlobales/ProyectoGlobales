// src/services/calendar/CalendarTimeService.ts
// Principio de Responsabilidad Única (SRP)
// Este servicio solo maneja operaciones relacionadas con tiempo y horarios

import { ICalendarTimeService } from './interfaces';
import { CalendarAppointment } from '@/types/calendar';

export class CalendarTimeService implements ICalendarTimeService {
  
  generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
    const slots: string[] = [];
    
    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Generate slots
    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slotDuration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    return slots;
  }

  isTimeSlotAvailable(timeSlot: string, appointments: CalendarAppointment[]): boolean {
    const slotTime = new Date(`2000-01-01T${timeSlot}:00`);
    
    return !appointments.some(appointment => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      // Create comparable times (same date)
      const appointmentStart = new Date(`2000-01-01T${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}:00`);
      const appointmentEnd = new Date(`2000-01-01T${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:00`);
      
      return slotTime >= appointmentStart && slotTime < appointmentEnd;
    });
  }

  formatTime(time: string, format: '12h' | '24h'): string {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (format === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // 12h format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  calculateAppointmentPosition(
    startTime: string, 
    endTime: string, 
    slotHeight: number
  ): { top: number; height: number } {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Calculate minutes from start of day
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const durationMinutes = endMinutes - startMinutes;
    
    // Assuming business starts at 9:00 AM (540 minutes from midnight)
    const businessStartMinutes = 9 * 60;
    const relativeStartMinutes = startMinutes - businessStartMinutes;
    
    // Calculate position (assuming 60px per hour)
    const minuteHeight = slotHeight / 60; // pixels per minute
    const top = relativeStartMinutes * minuteHeight;
    const height = durationMinutes * minuteHeight;
    
    return { top: Math.max(0, top), height: Math.max(30, height) }; // Minimum 30px height
  }

  getCurrentTimePosition(businessStart: string, slotHeight: number): number | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = businessStart.split(':').map(Number);
    const businessStartMinutes = startHour * 60 + startMinute;
    
    if (currentTime < businessStartMinutes) {
      return null; // Before business hours
    }
    
    const relativeMinutes = currentTime - businessStartMinutes;
    const minuteHeight = slotHeight / 60;
    
    return relativeMinutes * minuteHeight;
  }

  // Utility methods for mobile optimization
  getVisibleHoursForMobile(businessStart: string, businessEnd: string): { start: string; end: string } {
    // On mobile, show a smaller time window around current time or business hours
    const now = new Date();
    const currentHour = now.getHours();
    
    // If current time is within business hours, center around current time
    const [startHour] = businessStart.split(':').map(Number);
    const [endHour] = businessEnd.split(':').map(Number);
    
    if (currentHour >= startHour && currentHour <= endHour) {
      const windowStart = Math.max(startHour, currentHour - 2);
      const windowEnd = Math.min(endHour, currentHour + 6);
      
      return {
        start: `${windowStart.toString().padStart(2, '0')}:00`,
        end: `${windowEnd.toString().padStart(2, '0')}:00`
      };
    }
    
    // Otherwise, show business hours
    return { start: businessStart, end: businessEnd };
  }

  parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  addMinutesToTime(time: string, minutesToAdd: number): string {
    const { hours, minutes } = this.parseTime(time);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
}

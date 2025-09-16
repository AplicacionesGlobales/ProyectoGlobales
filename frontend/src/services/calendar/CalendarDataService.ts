// src/services/calendar/CalendarDataService.ts
// Principio de Responsabilidad Única (SRP)
// Este servicio solo maneja la comunicación con la API

import { ICalendarDataService, CreateAppointmentData } from './interfaces';
import { CalendarAppointment, CalendarDay, CalendarWeek, BusinessHours } from '@/types/calendar';
import { getCalendarAppointments, getDayAgenda } from '@/api/endpoints';

export class CalendarDataService implements ICalendarDataService {
  async getAppointments(
    brandId: number, 
    startDate: string, 
    endDate: string
  ): Promise<CalendarAppointment[]> {
    try {
      const response = await getCalendarAppointments(brandId, startDate, endDate);
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      throw new Error('Failed to fetch appointments');
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getDayData(brandId: number, date: string): Promise<CalendarDay> {
    try {
      const response = await getDayAgenda(brandId, date);
      
      if (response.success && response.data) {
        const agendaData = response.data;
        
        // Extract appointments from agenda items
        const appointments = agendaData.agenda
          .filter(item => item.type === 'appointment' && item.appointment)
          .map(item => item.appointment as CalendarAppointment);
        
        return {
          date,
          businessHours: agendaData.businessHours || { start: '09:00', end: '18:00', isClosed: false },
          appointments,
          availableSlots: this.extractAvailableSlots(agendaData.agenda || [])
        };
      }
      
      throw new Error('Failed to fetch day data');
    } catch (error) {
      console.error('Error fetching day data:', error);
      throw error;
    }
  }

  async getWeekData(brandId: number, startDate: string): Promise<CalendarWeek> {
    // Calculate end date (6 days after start)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    try {
      // Get all appointments for the week
      const appointments = await this.getAppointments(brandId, startDate, endDate);
      
      // Generate days for the week
      const days: CalendarDay[] = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayAppointments = appointments.filter(apt => 
          apt.startTime.split('T')[0] === dateStr
        );
        
        // For now, use default business hours - could be enhanced to fetch per day
        const businessHours: BusinessHours = { 
          start: '09:00', 
          end: '18:00', 
          isClosed: false 
        };
        
        days.push({
          date: dateStr,
          businessHours,
          appointments: dayAppointments,
          availableSlots: [] // Will be calculated by time service
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        startDate,
        endDate,
        days
      };
    } catch (error) {
      console.error('Error fetching week data:', error);
      throw error;
    }
  }

  async createAppointment(data: CreateAppointmentData): Promise<CalendarAppointment> {
    // TODO: Implement when backend endpoint is ready
    throw new Error('Create appointment not implemented yet');
  }

  async updateAppointment(
    id: number, 
    data: Partial<CalendarAppointment>
  ): Promise<CalendarAppointment> {
    // TODO: Implement when backend endpoint is ready
    throw new Error('Update appointment not implemented yet');
  }

  async cancelAppointment(id: number): Promise<boolean> {
    // TODO: Implement when backend endpoint is ready
    throw new Error('Cancel appointment not implemented yet');
  }

  private extractAvailableSlots(agenda: any[]): any[] {
    return agenda
      .filter(slot => slot.type === 'available')
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: true
      }));
  }
}

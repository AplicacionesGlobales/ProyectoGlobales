// src/services/calendar/interfaces.ts
// Principio de Inversión de Dependencias (DIP)
// Definimos abstracciones que no dependen de implementaciones concretas

import { CalendarAppointment, CalendarDay, CalendarWeek, TimeSlot } from '@/types/calendar';

export interface ICalendarDataService {
  getAppointments(brandId: number, startDate: string, endDate: string): Promise<CalendarAppointment[]>;
  getDayData(brandId: number, date: string): Promise<CalendarDay>;
  getWeekData(brandId: number, startDate: string): Promise<CalendarWeek>;
  createAppointment(data: CreateAppointmentData): Promise<CalendarAppointment>;
  updateAppointment(id: number, data: Partial<CalendarAppointment>): Promise<CalendarAppointment>;
  cancelAppointment(id: number): Promise<boolean>;
}

export interface ICalendarTimeService {
  generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[];
  isTimeSlotAvailable(timeSlot: string, appointments: CalendarAppointment[]): boolean;
  formatTime(time: string, format: '12h' | '24h'): string;
  calculateAppointmentPosition(startTime: string, endTime: string, slotHeight: number): {
    top: number;
    height: number;
  };
  getCurrentTimePosition(businessStart: string, slotHeight: number): number | null;
  getVisibleHoursForMobile(businessStart: string, businessEnd: string): { start: string; end: string };
}

export interface ICalendarDateService {
  getCurrentWeekDates(date: string, firstDayOfWeek: 0 | 1): string[];
  getWeekRange(date: string, firstDayOfWeek: 0 | 1): { start: string; end: string };
  addDays(date: string, days: number): string;
  addWeeks(date: string, weeks: number): string;
  formatDate(date: string, format: string, locale?: string): string;
  isToday(date: string): boolean;
  isSameDay(date1: string, date2: string): boolean;
}

export interface CreateAppointmentData {
  brandId: number;
  clientId?: number;
  serviceTypeId?: number;
  startTime: string;
  endTime: string;
  notes?: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
}

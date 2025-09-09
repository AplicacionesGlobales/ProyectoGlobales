// src/services/calendar/CalendarDateService.ts
// Principio de Responsabilidad Única (SRP)
// Este servicio solo maneja operaciones con fechas

import { ICalendarDateService } from './interfaces';

export class CalendarDateService implements ICalendarDateService {
  
  getCurrentWeekDates(date: string, firstDayOfWeek: 0 | 1 = 1): string[] {
    const targetDate = new Date(date);
    const startOfWeek = this.getStartOfWeek(targetDate, firstDayOfWeek);
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(currentDate.toISOString().split('T')[0]);
    }
    
    return weekDates;
  }

  getWeekRange(date: string, firstDayOfWeek: 0 | 1 = 1): { start: string; end: string } {
    const dates = this.getCurrentWeekDates(date, firstDayOfWeek);
    return {
      start: dates[0],
      end: dates[dates.length - 1]
    };
  }

  addDays(date: string, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  addWeeks(date: string, weeks: number): string {
    return this.addDays(date, weeks * 7);
  }

  formatDate(date: string, format: string, locale: string = 'es'): string {
    const dateObj = new Date(date);
    
    switch (format) {
      case 'EEEE': // Full day name
        return this.getDayName(dateObj.getDay(), 'long', locale);
      
      case 'EEE': // Short day name  
        return this.getDayName(dateObj.getDay(), 'short', locale);
      
      case 'E': // Minimal day name
        return this.getDayName(dateObj.getDay(), 'minimal', locale);
      
      case 'MMMM yyyy': // Full month and year
        return `${this.getMonthName(dateObj.getMonth(), 'long', locale)} ${dateObj.getFullYear()}`;
      
      case 'MMM yyyy': // Short month and year
        return `${this.getMonthName(dateObj.getMonth(), 'short', locale)} ${dateObj.getFullYear()}`;
      
      case 'dd/MM': // Day and month
        return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
      
      case 'dd/MM/yyyy': // Full date
        return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
      
      case 'd': // Just day number
        return dateObj.getDate().toString();
      
      case 'yyyy-MM-dd': // ISO format
      default:
        return date;
    }
  }

  isToday(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }

  isSameDay(date1: string, date2: string): boolean {
    return date1 === date2;
  }

  // Helper methods
  private getStartOfWeek(date: Date, firstDayOfWeek: 0 | 1): Date {
    const day = date.getDay();
    const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
    const result = new Date(date);
    result.setDate(date.getDate() - diff);
    return result;
  }

  private getDayName(dayIndex: number, length: 'long' | 'short' | 'minimal', locale: string): string {
    const days = {
      es: {
        long: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        minimal: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
      },
      en: {
        long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        minimal: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      }
    };

    return days[locale as keyof typeof days]?.[length]?.[dayIndex] || days.es[length][dayIndex];
  }

  private getMonthName(monthIndex: number, length: 'long' | 'short', locale: string): string {
    const months = {
      es: {
        long: [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        short: [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ]
      },
      en: {
        long: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        short: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
      }
    };

    return months[locale as keyof typeof months]?.[length]?.[monthIndex] || months.es[length][monthIndex];
  }

  // Utility methods for mobile calendar optimization
  getCurrentWeek(): { start: string; end: string } {
    const today = new Date().toISOString().split('T')[0];
    return this.getWeekRange(today);
  }

  getPreviousWeek(currentDate: string): string {
    return this.addWeeks(currentDate, -1);
  }

  getNextWeek(currentDate: string): string {
    return this.addWeeks(currentDate, 1);
  }

  getWeekDayIndex(date: string, firstDayOfWeek: 0 | 1 = 1): number {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    if (firstDayOfWeek === 1) {
      // Monday is first day (0), Sunday is last (6)
      return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    }
    
    // Sunday is first day
    return dayOfWeek;
  }

  isWeekend(date: string): boolean {
    const dateObj = new Date(date);
    const day = dateObj.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  getDaysUntilDate(fromDate: string, toDate: string): number {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = to.getTime() - from.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

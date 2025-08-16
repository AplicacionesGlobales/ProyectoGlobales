// types/schedule.types.ts

// Enum para días de la semana
export enum DayOfWeek {
  DOMINGO = 0,
  LUNES = 1,
  MARTES = 2,
  MIERCOLES = 3,
  JUEVES = 4,
  VIERNES = 5,
  SABADO = 6
}

// Nombres de días en español
export const DAY_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.DOMINGO]: 'Domingo',
  [DayOfWeek.LUNES]: 'Lunes',
  [DayOfWeek.MARTES]: 'Martes',
  [DayOfWeek.MIERCOLES]: 'Miércoles',
  [DayOfWeek.JUEVES]: 'Jueves',
  [DayOfWeek.VIERNES]: 'Viernes',
  [DayOfWeek.SABADO]: 'Sábado'
};

// Nombres cortos de días
export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.DOMINGO]: 'Dom',
  [DayOfWeek.LUNES]: 'Lun',
  [DayOfWeek.MARTES]: 'Mar',
  [DayOfWeek.MIERCOLES]: 'Mié',
  [DayOfWeek.JUEVES]: 'Jue',
  [DayOfWeek.VIERNES]: 'Vie',
  [DayOfWeek.SABADO]: 'Sáb'
};

// Tipos de horarios especiales
export enum SpecialHourType {
  CLOSED = 'closed',
  HOLIDAY = 'holiday',
  VACATION = 'vacation',
  SPECIAL_EVENT = 'special_event',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom'
}

// Etiquetas para tipos de horarios especiales
export const SPECIAL_HOUR_LABELS: Record<SpecialHourType, string> = {
  [SpecialHourType.CLOSED]: 'Cerrado',
  [SpecialHourType.HOLIDAY]: 'Día Festivo',
  [SpecialHourType.VACATION]: 'Vacaciones',
  [SpecialHourType.SPECIAL_EVENT]: 'Evento Especial',
  [SpecialHourType.MAINTENANCE]: 'Mantenimiento',
  [SpecialHourType.CUSTOM]: 'Personalizado'
};

// Interface para horario de trabajo base
export interface WorkingHours {
  isOpen: boolean;
  openTime?: string; // "HH:MM" format
  closeTime?: string; // "HH:MM" format
}

// Interface para configuración de horarios por día
export interface DaySchedule extends WorkingHours {
  dayOfWeek: DayOfWeek;
  dayName: string;
}

// Interface para horario especial completo
export interface SpecialDay {
  id?: number;
  date: Date;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  type: SpecialHourType;
  reason?: string;
  description?: string;
}

// Interface para configuración de citas
export interface ScheduleSettings {
  defaultDuration: number; // minutos
  bufferTime: number; // minutos
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  allowSameDayBooking: boolean;
}

// Interface para slot de tiempo disponible
export interface TimeSlot {
  time: string; // "HH:MM"
  available: boolean;
  reason?: string; // Por qué no está disponible
}

// Interface para validación de horarios
export interface ScheduleValidation {
  isValid: boolean;
  reason?: string;
  suggestedAlternatives?: string[];
}

// Opciones predefinidas para horarios comunes
export const COMMON_HOURS = {
  MORNING_START: ['07:00', '08:00', '09:00', '10:00'],
  MORNING_END: ['12:00', '13:00', '14:00'],
  AFTERNOON_START: ['13:00', '14:00', '15:00'],
  AFTERNOON_END: ['17:00', '18:00', '19:00', '20:00', '21:00'],
  FULL_DAY_START: ['07:00', '08:00', '09:00'],
  FULL_DAY_END: ['18:00', '19:00', '20:00', '21:00']
};

// Templates de horarios típicos
export const SCHEDULE_TEMPLATES = {
  STANDARD_BUSINESS: {
    name: 'Horario Comercial Estándar',
    description: 'Lunes a Viernes 9:00-18:00, Sábado 9:00-14:00',
    schedule: [
      { dayOfWeek: DayOfWeek.LUNES, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: DayOfWeek.MARTES, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: DayOfWeek.MIERCOLES, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: DayOfWeek.JUEVES, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: DayOfWeek.VIERNES, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: DayOfWeek.SABADO, isOpen: true, openTime: '09:00', closeTime: '14:00' },
      { dayOfWeek: DayOfWeek.DOMINGO, isOpen: false }
    ]
  },
  SALON_HOURS: {
    name: 'Horario de Salón',
    description: 'Martes a Sábado 10:00-19:00',
    schedule: [
      { dayOfWeek: DayOfWeek.LUNES, isOpen: false },
      { dayOfWeek: DayOfWeek.MARTES, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: DayOfWeek.MIERCOLES, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: DayOfWeek.JUEVES, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: DayOfWeek.VIERNES, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: DayOfWeek.SABADO, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: DayOfWeek.DOMINGO, isOpen: false }
    ]
  },
  EXTENDED_HOURS: {
    name: 'Horario Extendido',
    description: 'Lunes a Sábado 8:00-20:00',
    schedule: [
      { dayOfWeek: DayOfWeek.LUNES, isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: DayOfWeek.MARTES, isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: DayOfWeek.MIERCOLES, isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: DayOfWeek.JUEVES, isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: DayOfWeek.VIERNES, isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: DayOfWeek.SABADO, isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: DayOfWeek.DOMINGO, isOpen: false }
    ]
  }
};

// Utilidades para trabajar con horarios
export const scheduleUtils = {
  // Convertir día de la semana a nombre
  getDayName: (dayOfWeek: DayOfWeek): string => DAY_NAMES[dayOfWeek],
  
  // Convertir día de la semana a nombre corto
  getDayShortName: (dayOfWeek: DayOfWeek): string => DAY_SHORT_NAMES[dayOfWeek],
  
  // Obtener todos los días de la semana ordenados (empezando por lunes)
  getAllDays: (): DaySchedule[] => {
    return [
      DayOfWeek.LUNES,
      DayOfWeek.MARTES,
      DayOfWeek.MIERCOLES,
      DayOfWeek.JUEVES,
      DayOfWeek.VIERNES,
      DayOfWeek.SABADO,
      DayOfWeek.DOMINGO
    ].map(day => ({
      dayOfWeek: day,
      dayName: DAY_NAMES[day],
      isOpen: false
    }));
  },
  
  // Validar formato de hora
  isValidTimeFormat: (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },
  
  // Comparar dos horas (retorna true si time1 < time2)
  isTimeBefore: (time1: string, time2: string): boolean => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return h1 < h2 || (h1 === h2 && m1 < m2);
  },
  
  // Calcular duración entre dos horas en minutos
  calculateDuration: (startTime: string, endTime: string): number => {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;
    return end - start;
  },
  
  // Formatear hora para mostrar
  formatTime: (time: string): string => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minutes} ${period}`;
  },
  
  // Obtener día de la semana de una fecha
  getDayOfWeekFromDate: (date: Date): DayOfWeek => {
    return date.getDay() as DayOfWeek;
  },
  
  // Validar que el horario de apertura sea antes que el de cierre
  validateWorkingHours: (openTime: string, closeTime: string): boolean => {
    return scheduleUtils.isTimeBefore(openTime, closeTime);
  },
  
  // Generar array de horas para select
  generateHourOptions: (startHour: number = 6, endHour: number = 23, interval: number = 30): string[] => {
    const options: string[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  }
};
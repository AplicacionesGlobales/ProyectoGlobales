// src/hooks/useCalendarServices.ts  
// Principio de Inversión de Dependencias (DIP) y Patrón Facade
// Proporciona acceso unificado a todos los servicios de calendario

import { useMemo } from 'react';
import { CalendarDataService } from '@/services/calendar/CalendarDataService';
import { CalendarTimeService } from '@/services/calendar/CalendarTimeService';
import { CalendarDateService } from '@/services/calendar/CalendarDateService';
import type { 
  ICalendarDataService, 
  ICalendarTimeService, 
  ICalendarDateService 
} from '@/services/calendar/interfaces';

interface CalendarServices {
  dataService: ICalendarDataService;
  timeService: ICalendarTimeService;
  dateService: ICalendarDateService;
}

export const useCalendarServices = (): CalendarServices => {
  // Principio de Responsabilidad Única (SRP)
  // Cada servicio tiene una responsabilidad específica
  const services = useMemo(() => ({
    dataService: new CalendarDataService(),
    timeService: new CalendarTimeService(), 
    dateService: new CalendarDateService()
  }), []);

  return services;
};

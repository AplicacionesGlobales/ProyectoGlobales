import { useState } from 'react';
import { createAppointment } from '@/api/endpoints';
import { 
  CreateAppointmentRequest, 
  CreateAppointmentResponse, 
  AppointmentFormData,
  ServiceType 
} from '@/api/types';
import { authService } from '@/services/authService';

export const useAppointments = () => {
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState<string | null>(null);

  // Crear nueva cita
  const createNewAppointment = async (
    appointmentData: AppointmentFormData,
    service: ServiceType
  ): Promise<CreateAppointmentResponse | null> => {
    setIsCreatingAppointment(true);
    setAppointmentError(null);
    setAppointmentSuccess(null);
    
    try {
      // Verificar autenticación
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      // Validaciones
      if (!appointmentData.selectedDate || !appointmentData.selectedTime) {
        throw new Error('Debe seleccionar fecha y hora');
      }

      // serviceTypeId is now optional - will use default if not provided
      // if (!appointmentData.serviceTypeId) {
      //   throw new Error('Debe seleccionar un servicio');
      // }

      // Combinar fecha y hora para crear ISO string
      const selectedDate = new Date(appointmentData.selectedDate);
      const [hours, minutes] = appointmentData.selectedTime.split(':').map(Number);
      
      selectedDate.setHours(hours, minutes, 0, 0);
      
      // Convertir a ISO string (UTC)
      const startTime = selectedDate.toISOString();

      const requestData: CreateAppointmentRequest = {
        startTime,
        serviceTypeId: appointmentData.serviceTypeId || undefined,
        notes: appointmentData.notes || undefined
      };

      const response = await createAppointment(requestData, service.brandId);

      setAppointmentSuccess('Cita creada exitosamente');
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cita';
      
      // Manejar errores específicos
      if (errorMessage.includes('Authentication required') || 
          errorMessage.includes('Usuario no autenticado') ||
          errorMessage.includes('401')) {
        setAppointmentError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (errorMessage.includes('conflict') || errorMessage.includes('conflicto')) {
        setAppointmentError('El horario seleccionado no está disponible. Por favor, elige otro.');
      } else if (errorMessage.includes('validation') || errorMessage.includes('validación')) {
        setAppointmentError('Datos inválidos. Revisa la información ingresada.');
      } else {
        setAppointmentError(errorMessage);
      }
      
      return null;
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  // Validar horario disponible (placeholder para futura implementación)
  const validateTimeSlot = async (
    date: Date, 
    time: string, 
    serviceTypeId: number
  ): Promise<boolean> => {
    // TODO: Implementar validación con el backend
    // Por ahora retornamos true
    return true;
  };

  // Limpiar mensajes
  const clearMessages = () => {
    setAppointmentError(null);
    setAppointmentSuccess(null);
  };

  // Generar horarios disponibles (placeholder)
  const generateTimeSlots = (date: Date): string[] => {
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    const intervalMinutes = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  };

  // Validar si una fecha es válida para citas (no pasada, no domingos, etc.)
  const isValidAppointmentDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    // No permitir fechas pasadas
    if (selectedDate < today) {
      return false;
    }
    
    // No permitir domingos (día 0)
    if (selectedDate.getDay() === 0) {
      return false;
    }
    
    // No permitir fechas muy lejanas (más de 3 meses)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (selectedDate > maxDate) {
      return false;
    }
    
    return true;
  };

  return {
    // Estado
    isCreatingAppointment,
    appointmentError,
    appointmentSuccess,

    // Funciones principales
    createNewAppointment,
    validateTimeSlot,
    clearMessages,

    // Funciones helper
    generateTimeSlots,
    isValidAppointmentDate,
  };
};
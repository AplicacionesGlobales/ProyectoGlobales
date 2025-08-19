
// src/appointments/utils/appointment.constants.ts
export const APPOINTMENT_CONSTANTS = {
  STATUS: {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
    COMPLETED: 'COMPLETED'
  } as const,

  DURATION: {
    MIN: 15,
    MAX: 480,
    DEFAULT: 30
  } as const,

  BUFFER_TIME: {
    MIN: 0,
    MAX: 60,
    DEFAULT: 5
  } as const,

  ADVANCE_BOOKING: {
    MIN_HOURS: 0,
    MAX_HOURS: 168, // 1 semana
    DEFAULT_MIN_HOURS: 2,
    MAX_DAYS: 365,
    DEFAULT_MAX_DAYS: 30
  } as const,

  MESSAGES: {
    BUSINESS_CLOSED: 'El negocio está cerrado este día',
    OUTSIDE_HOURS: 'La cita debe estar dentro del horario de operación',
    TIME_CONFLICT: 'Ya existe una cita programada en este horario',
    INVALID_DURATION: 'Duración inválida',
    INVALID_TIME_FORMAT: 'Formato de hora inválido (use HH:MM)',
    APPOINTMENT_IN_PAST: 'La fecha de la cita debe ser en el futuro',
    INSUFFICIENT_ADVANCE: 'Debe reservar con más anticipación',
    EXCESSIVE_ADVANCE: 'No puede reservar con tanta anticipación',
    SAME_DAY_NOT_ALLOWED: 'No se permiten reservas para el mismo día',
    CLIENT_NOT_FOUND: 'Cliente no encontrado',
    APPOINTMENT_NOT_FOUND: 'Cita no encontrada',
    ACCESS_DENIED: 'No tiene permisos para esta operación'
  } as const,

  TIME_FORMATS: {
    DISPLAY: 'DD/MM/YYYY HH:mm',
    API: 'YYYY-MM-DDTHH:mm:ss.sssZ',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm'
  } as const
};

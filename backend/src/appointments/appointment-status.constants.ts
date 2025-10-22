import { AppointmentStatus } from 'generated/prisma';

// Matriz de transiciones válidas
export const VALID_STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.COMPLETED]: [], // Estado final
  [AppointmentStatus.CANCELLED]: [], // Estado final
  [AppointmentStatus.NO_SHOW]: [], // Estado final
};

// Estados que requieren razón obligatoria
export const STATUS_CHANGE_REASONS_REQUIRED: AppointmentStatus[] = [
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
];

// Estados finales (no se puede cambiar desde estos)
export const FINAL_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
];

// Configuración de horas mínimas para cancelación
export const CANCELLATION_MIN_HOURS = 2;

// Roles que pueden realizar ciertas transiciones
export const STATUS_TRANSITION_PERMISSIONS = {
  [AppointmentStatus.NO_SHOW]: ['ROOT', 'ADMIN'],
  [AppointmentStatus.IN_PROGRESS]: ['ROOT', 'ADMIN'],
};

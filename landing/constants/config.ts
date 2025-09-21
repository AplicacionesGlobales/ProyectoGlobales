// constants/config.ts
import { NotificationOption, LanguageOption } from "@/types/config"

export const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'newAppointments',
    label: 'Nuevas citas',
    description: 'Recibir notificación cuando se agenden nuevas citas'
  },
  {
    key: 'appointmentReminders',
    label: 'Recordatorios de citas',
    description: 'Enviar recordatorios antes de las citas'
  },
  {
    key: 'cancellations',
    label: 'Cancelaciones',
    description: 'Notificar cuando se cancelen citas'
  },
  {
    key: 'emailNotifications',
    label: 'Notificaciones por email',
    description: 'Recibir notificaciones en tu correo electrónico'
  },
  {
    key: 'smsNotifications',
    label: 'Notificaciones por SMS',
    description: 'Recibir notificaciones en tu teléfono móvil'
  }
]

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' }
]

export const DEFAULT_NOTIFICATION_SETTINGS = {
  newAppointments: true,
  appointmentReminders: true,
  cancellations: true,
  emailNotifications: true,
  smsNotifications: false
}

export const DEFAULT_APPEARANCE_SETTINGS = {
  darkMode: false,
  language: 'es'
}
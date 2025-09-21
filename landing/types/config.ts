// types/config.ts
export interface UserData {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
}

export interface BrandData {
  id: number
  name: string
  description?: string
  address?: string
  phone?: string
}

export interface BusinessForm {
  name: string
  description: string
  phone: string
  email: string
  address: string
}

export interface UserForm {
  firstName: string
  lastName: string
  email: string
  username: string
}

export interface NotificationSettings {
  newAppointments: boolean
  appointmentReminders: boolean
  cancellations: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

export interface AppearanceSettings {
  darkMode: boolean
  language: string
}

export interface NotificationOption {
  key: keyof NotificationSettings
  label: string
  description: string
}

export interface LanguageOption {
  value: string
  label: string
}

export interface TabOption {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}
// components/configuraciones/NotificationsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell } from "lucide-react"

interface NotificationSettings {
  newAppointments: boolean
  appointmentReminders: boolean
  cancellations: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

interface NotificationsTabProps {
  notificationSettings: NotificationSettings
  saving: boolean
  onNotificationChange: (field: keyof NotificationSettings, value: boolean) => void
  onSave: () => void
}

export const NotificationsTab = ({ 
  notificationSettings, 
  saving, 
  onNotificationChange, 
  onSave 
}: NotificationsTabProps) => {
  const notificationOptions = [
    {
      key: 'newAppointments' as keyof NotificationSettings,
      label: 'Nuevas citas',
      description: 'Recibir notificación cuando se agenden nuevas citas'
    },
    {
      key: 'appointmentReminders' as keyof NotificationSettings,
      label: 'Recordatorios de citas',
      description: 'Enviar recordatorios antes de las citas'
    },
    {
      key: 'cancellations' as keyof NotificationSettings,
      label: 'Cancelaciones',
      description: 'Notificar cuando se cancelen citas'
    },
    {
      key: 'emailNotifications' as keyof NotificationSettings,
      label: 'Notificaciones por email',
      description: 'Recibir notificaciones en tu correo electrónico'
    },
    {
      key: 'smsNotifications' as keyof NotificationSettings,
      label: 'Notificaciones por SMS',
      description: 'Recibir notificaciones en tu teléfono móvil'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
        </CardTitle>
        <CardDescription>
          Configura qué notificaciones quieres recibir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationOptions.map((option, index) => (
          <div key={option.key}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{option.label}</Label>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
              <Switch 
                checked={notificationSettings[option.key]}
                onCheckedChange={(checked) => onNotificationChange(option.key, checked)}
              />
            </div>
            {index < notificationOptions.length - 1 && <Separator />}
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Notificaciones'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
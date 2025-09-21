// components/configuraciones/ConfiguracionesTabs.tsx
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building, Bell, Clock, Palette } from "lucide-react"
import { BusinessInfoTab } from "@/components/panel/config/business-info-tab"
import { UserInfoTab } from "@/components/panel/config/user-info-tab"
import { ScheduleTab } from "@/components/panel/config/schedule-tab"
import { NotificationsTab } from "@/components/panel/config/notifications-tab"
import { AppearanceTab } from "@/components/panel/config/appearance-tab"
import { BusinessForm, UserForm, NotificationSettings, AppearanceSettings } from "@/types/config"

interface ConfiguracionesTabsProps {
  brandId?: number
  businessForm: BusinessForm
  userForm: UserForm
  notificationSettings: NotificationSettings
  appearanceSettings: AppearanceSettings
  saving: boolean
  onBusinessFormChange: (field: keyof BusinessForm, value: string) => void
  onUserFormChange: (field: keyof UserForm, value: string) => void
  onNotificationChange: (field: keyof NotificationSettings, value: boolean) => void
  onAppearanceChange: (field: keyof AppearanceSettings, value: any) => void
  onSaveBusinessInfo: () => void
  onSaveNotifications: () => void
  onSaveAppearance: () => void
}

export const ConfiguracionesTabs = ({
  brandId,
  businessForm,
  userForm,
  notificationSettings,
  appearanceSettings,
  saving,
  onBusinessFormChange,
  onUserFormChange,
  onNotificationChange,
  onAppearanceChange,
  onSaveBusinessInfo,
  onSaveNotifications,
  onSaveAppearance
}: ConfiguracionesTabsProps) => {
  const [activeTab, setActiveTab] = useState("business")

  const tabs = [
    {
      value: "business",
      label: "Negocio",
      icon: Building
    },
    {
      value: "user",
      label: "Personal",
      icon: User
    },
    {
      value: "schedule",
      label: "Horarios",
      icon: Clock
    },
    {
      value: "notifications",
      label: "Notificaciones",
      icon: Bell
    },
    {
      value: "appearance",
      label: "Apariencia",
      icon: Palette
    }
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="business" className="space-y-6">
        <BusinessInfoTab
          businessForm={businessForm}
          saving={saving}
          onFormChange={onBusinessFormChange}
          onSave={onSaveBusinessInfo}
        />
      </TabsContent>

      <TabsContent value="user" className="space-y-6">
        <UserInfoTab
          userForm={userForm}
          onFormChange={onUserFormChange}
        />
      </TabsContent>

      <TabsContent value="schedule" className="space-y-6">
        {brandId && <ScheduleTab brandId={brandId} />}
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <NotificationsTab
          notificationSettings={notificationSettings}
          saving={saving}
          onNotificationChange={onNotificationChange}
          onSave={onSaveNotifications}
        />
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <AppearanceTab
          appearanceSettings={appearanceSettings}
          saving={saving}
          onAppearanceChange={onAppearanceChange}
          onSave={onSaveAppearance}
        />
      </TabsContent>
    </Tabs>
  )
}
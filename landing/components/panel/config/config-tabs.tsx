// components/panel/config/config-tabs.tsx
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Clock, Palette, CreditCard, BarChart3 } from "lucide-react"
import { ProfileTab } from "@/components/panel/config/profile-tab"
import { ScheduleTab } from "@/components/panel/config/schedule-tab"
import { NotificationsTab } from "@/components/panel/config/notifications-tab"
import { AppearanceTab } from "@/components/panel/config/appearance-tab"
import { SubscriptionTab } from "@/components/panel/config/subscription-tab"
import { ReportsTab } from "@/components/panel/config/reports-tab"
import { BusinessForm, UserForm, NotificationSettings, AppearanceSettings } from "@/types/config"
import { SubscriptionFeatures } from "@/services/subscription.service"

interface ConfiguracionesTabsProps {
  brandId?: number
  businessForm: BusinessForm
  userForm: UserForm
  notificationSettings: NotificationSettings
  appearanceSettings: AppearanceSettings
  subscriptionData: SubscriptionFeatures | null
  loadingSubscription: boolean
  saving: boolean
  onBusinessFormChange: (field: keyof BusinessForm, value: string) => void
  onUserFormChange: (field: keyof UserForm, value: string) => void
  onNotificationChange: (field: keyof NotificationSettings, value: boolean) => void
  onAppearanceChange: (field: keyof AppearanceSettings, value: any) => void
  onSaveBusinessInfo: () => void
  onSaveNotifications: () => void
  onSaveAppearance: () => void
  onUpgradePlan: () => void
  onUpdatePaymentMethod: () => void
}

export const ConfiguracionesTabs = ({
  brandId,
  businessForm,
  userForm,
  notificationSettings,
  appearanceSettings,
  subscriptionData,
  loadingSubscription,
  saving,
  onBusinessFormChange,
  onUserFormChange,
  onNotificationChange,
  onAppearanceChange,
  onSaveBusinessInfo,
  onSaveNotifications,
  onSaveAppearance,
  onUpgradePlan,
  onUpdatePaymentMethod
}: ConfiguracionesTabsProps) => {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    {
      value: "profile",
      label: "Perfil",
      icon: User
    },
    {
      value: "subscription",
      label: "Suscripción",
      icon: CreditCard
    },
    {
      value: "reports",
      label: "Reportes",
      icon: BarChart3
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
      <TabsList className="grid w-full grid-cols-6">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{label}</span>
            <span className="lg:hidden">{label.slice(0, 3)}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileTab
          businessForm={businessForm}
          userForm={userForm}
          saving={saving}
          onBusinessFormChange={onBusinessFormChange}
          onUserFormChange={onUserFormChange}
          onSaveBusinessInfo={onSaveBusinessInfo}
        />
      </TabsContent>

      <TabsContent value="subscription" className="space-y-6">
        <SubscriptionTab
          subscriptionData={subscriptionData}
          loading={loadingSubscription}
          brandId={brandId}
          onUpgradePlan={onUpgradePlan}
          onUpdatePaymentMethod={onUpdatePaymentMethod}
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <ReportsTab brandId={brandId} />
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
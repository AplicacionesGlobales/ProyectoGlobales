// app/panel/configuraciones/page.tsx
"use client"
import { useConfiguraciones } from "@/hooks/use-config"
import { AlertMessages } from "@/components/panel/config/alert-messages"
import { ConfiguracionesTabs } from "@/components/panel/config/config-tabs"

export default function ConfiguracionesPage() {
  const {
    loading,
    saving,
    error,
    success,
    brandData,
    businessForm,
    userForm,
    notificationSettings,
    appearanceSettings,
    subscriptionData,
    loadingSubscription,
    handleBusinessFormChange,
    handleUserFormChange,
    handleNotificationChange,
    handleAppearanceChange,
    handleSaveBusinessInfo,
    handleSaveNotifications,
    handleSaveAppearance,
    handleUpgradePlan,
    handleUpdatePaymentMethod
  } = useConfiguraciones()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones</h1>
          <p className="text-muted-foreground">
            Cargando configuración...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones</h1>
          <p className="text-muted-foreground">
            Personaliza la configuración de tu negocio, cuenta y suscripción.
          </p>
        </div>
      </div>

      <AlertMessages error={error} success={success} />

      <ConfiguracionesTabs
        brandId={brandData?.id}
        businessForm={businessForm}
        userForm={userForm}
        notificationSettings={notificationSettings}
        appearanceSettings={appearanceSettings}
        subscriptionData={subscriptionData}
        loadingSubscription={loadingSubscription}
        saving={saving}
        onBusinessFormChange={handleBusinessFormChange}
        onUserFormChange={handleUserFormChange}
        onNotificationChange={handleNotificationChange}
        onAppearanceChange={handleAppearanceChange}
        onSaveBusinessInfo={handleSaveBusinessInfo}
        onSaveNotifications={handleSaveNotifications}
        onSaveAppearance={handleSaveAppearance}
        onUpgradePlan={handleUpgradePlan}
        onUpdatePaymentMethod={handleUpdatePaymentMethod}
      />
    </div>
  )
}
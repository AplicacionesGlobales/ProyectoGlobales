import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { SubscriptionFeatures } from "@/services/subscription.service"
import { paymentsService } from "@/services/payments.service"
import { PlanCard } from "./plan-card"
import Swal from 'sweetalert2'

interface SubscriptionManagerProps {
  subscriptionData: SubscriptionFeatures | null
  brandId?: number
  onChangePlan?: (planId: number) => Promise<void>
  onPlanChanged?: () => void
}

export const SubscriptionManager = ({ subscriptionData, brandId, onChangePlan, onPlanChanged }: SubscriptionManagerProps) => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const availablePlans = [
    { 
      id: 1, 
      name: "Web Plan W", 
      price: 29.99, 
      description: "Sitio Web básico",
      features: [
        "Sitio web personalizado",
        "Gestión de citas básica",
        "Panel de administración",
        "Soporte por email",
        "Hasta 100 citas/mes"
      ]
    },
    { 
      id: 2, 
      name: "App Plan A", 
      price: 49.99, 
      description: "Aplicación móvil",
      features: [
        "Todo lo del Plan Web",
        "Aplicación móvil nativa",
        "Notificaciones push",
        "Calendario sincronizado",
        "Hasta 500 citas/mes",
        "Soporte prioritario"
      ]
    },
    { 
      id: 3, 
      name: "Complete Plan C", 
      price: 79.99, 
      description: "Paquete completo",
      features: [
        "Todo lo del Plan App",
        "Múltiples sucursales",
        "Reportes avanzados",
        "API personalizada",
        "Citas ilimitadas",
        "Soporte 24/7",
        "Capacitación incluida"
      ]
    }
  ]

  const currentPlanId = subscriptionData?.plan?.id

  const handleChange = async () => {
    if (!selectedPlan || !brandId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor selecciona un plan.',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    if (selectedPlan === currentPlanId) {
      await Swal.fire({
        icon: 'info',
        title: 'Plan actual',
        text: 'Ya tienes este plan activo.',
        confirmButtonColor: '#3b82f6',
      })
      return
    }

    const selectedPlanInfo = availablePlans.find(p => p.id === selectedPlan)
    const currentPlanInfo = availablePlans.find(p => p.id === currentPlanId)

    // Confirmar el cambio
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar cambio de plan?',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Plan actual:</strong> ${currentPlanInfo?.name || 'N/A'}</p>
          <p><strong>Nuevo plan:</strong> ${selectedPlanInfo?.name}</p>
          <p><strong>Nuevo precio:</strong> $${selectedPlanInfo?.price}/mes</p>
          <hr class="my-3"/>
          <p class="text-sm text-gray-600">
            <strong>Nota:</strong> Los cambios se aplicarán una vez que cierres sesión, 
            vuelvas a ingresar y realices el pago correspondiente.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar plan',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
    })

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      const response = await paymentsService.changePlan(brandId, selectedPlan)
      
      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Cambio exitoso!',
          html: `
            <div class="text-left space-y-2">
              <p>Tu plan ha sido cambiado a <strong>${selectedPlanInfo?.name}</strong></p>
              <hr class="my-3"/>
              <p class="text-sm text-gray-600">
                <strong>Importante:</strong> Los cambios se aplicarán completamente una vez que:
              </p>
              <ul class="text-sm text-gray-600 list-disc list-inside ml-2">
                <li>Cierres sesión</li>
                <li>Vuelvas a ingresar</li>
                <li>Realices el pago correspondiente</li>
              </ul>
            </div>
          `,
          confirmButtonColor: '#10b981',
        })

        // Llamar callbacks
        if (onChangePlan) await onChangePlan(selectedPlan)
        if (onPlanChanged) onPlanChanged()
        
        // Reset selection
        setSelectedPlan(null)
      } else {
        throw new Error(response.errors?.[0]?.description || 'Error cambiando plan')
      }
    } catch (error: any) {
      console.error('Error changing plan:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Error al cambiar plan',
        text: error.message || 'Hubo un problema al cambiar el plan. Inténtalo de nuevo.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administrar Suscripción</CardTitle>
          <CardDescription>
            Selecciona el plan que mejor se adapte a tus necesidades
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            isCurrentPlan={plan.id === currentPlanId}
            isSelected={plan.id === selectedPlan}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </div>

      {selectedPlan && selectedPlan !== currentPlanId && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Has seleccionado: {availablePlans.find(p => p.id === selectedPlan)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Confirma el cambio para proceder
                </p>
              </div>
              <Button 
                onClick={handleChange} 
                disabled={loading || !brandId}
                size="lg"
              >
                {loading ? 'Procesando...' : 'Confirmar Cambio de Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!brandId && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">
              ⚠️ No se pudo obtener el ID de la marca. Por favor, recarga la página.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

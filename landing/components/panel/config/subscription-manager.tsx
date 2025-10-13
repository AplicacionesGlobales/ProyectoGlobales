import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { SubscriptionFeatures } from "@/services/subscription.service"
import { paymentsService } from "@/services/payments.service"
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
    { id: 1, name: "Web Plan W", price: 29.99, description: "Sitio Web básico" },
    { id: 2, name: "App Plan A", price: 49.99, description: "Aplicación móvil" },
    { id: 3, name: "Complete Plan C", price: 79.99, description: "Paquete completo" }
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
        <div class="text-left">
          <p><strong>Plan actual:</strong> ${currentPlanInfo?.name || 'N/A'}</p>
          <p><strong>Nuevo plan:</strong> ${selectedPlanInfo?.name}</p>
          <p><strong>Nuevo precio:</strong> $${selectedPlanInfo?.price}/mes</p>
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
          title: '¡Plan cambiado exitosamente!',
          text: response.data?.message || `Tu plan ha sido cambiado a ${selectedPlanInfo?.name}`,
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
    <Card>
      <CardHeader>
        <CardTitle>Administrar Suscripción</CardTitle>
        <CardDescription>
          Actualizar plan y ver opciones de facturación
          {currentPlanId && (
            <span className="block mt-1 text-sm font-medium text-blue-600">
              Plan actual: {availablePlans.find(p => p.id === currentPlanId)?.name}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center">
          <Select onValueChange={(v) => setSelectedPlan(Number(v))} value={selectedPlan?.toString() || ""}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Selecciona un plan" />
            </SelectTrigger>
            <SelectContent>
              {availablePlans.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  <div className="flex flex-col">
                    <span>{p.name} - ${p.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{p.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleChange} disabled={!selectedPlan || loading || !brandId}>
            {loading ? 'Procesando...' : 'Cambiar Plan'}
          </Button>
        </div>
        
        {!brandId && (
          <p className="text-sm text-red-500 mt-2">No se pudo obtener el ID del brand</p>
        )}
      </CardContent>
    </Card>
  )
}

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { SubscriptionFeatures } from "@/services/subscription.service"

interface SubscriptionManagerProps {
  subscriptionData: SubscriptionFeatures | null
  onChangePlan?: (planId: number) => Promise<void>
}

export const SubscriptionManager = ({ subscriptionData, onChangePlan }: SubscriptionManagerProps) => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const availablePlans = [
    { id: 1, name: "Web Plan W", price: 29.99 },
    { id: 2, name: "App Plan A", price: 49.99 },
    { id: 3, name: "Complete Plan C", price: 79.99 }
  ]

  const handleChange = async () => {
    if (!selectedPlan || !onChangePlan) return
    setLoading(true)
    try {
      await onChangePlan(selectedPlan)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrar Suscripción</CardTitle>
        <CardDescription>Actualizar plan y ver opciones de facturación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center">
          <Select onValueChange={(v) => setSelectedPlan(Number(v))}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Selecciona un plan" />
            </SelectTrigger>
            <SelectContent>
              {availablePlans.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name} - ${p.price.toFixed(2)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleChange} disabled={!selectedPlan || loading}>
            {loading ? 'Procesando...' : 'Cambiar Plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

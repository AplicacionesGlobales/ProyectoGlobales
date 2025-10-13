// components/panel/config/subscription-tab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  Package, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from "lucide-react"
import { SubscriptionFeatures } from "@/services/subscription.service"
import { useState, useEffect } from "react"
import { SubscriptionManager } from "@/components/panel/config/subscription-manager"
import { BillingHistory } from "@/components/panel/config/billing-history"
import { paymentsService, PaymentRecord } from "@/services/payments.service"

interface SubscriptionTabProps {
  subscriptionData: SubscriptionFeatures | null
  loading?: boolean
  brandId?: number
  onUpgradePlan?: () => void
  onUpdatePaymentMethod?: () => void
}

export const SubscriptionTab = ({ 
  subscriptionData,
  loading,
  brandId,
  onUpgradePlan,
  onUpdatePaymentMethod
}: SubscriptionTabProps) => {
  const [showManager, setShowManager] = useState(false)
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)

  // Cargar historial de pagos cuando se monta el componente
  useEffect(() => {
    if (brandId) {
      loadPayments()
    }
  }, [brandId])

  const loadPayments = async () => {
    if (!brandId) return
    
    setLoadingPayments(true)
    try {
      const response = await paymentsService.getPaymentsByBrand(brandId)
      if (response.success && response.data) {
        setPaymentRecords(response.data)
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  const handleDownloadReceipt = (paymentId: number) => {
    paymentsService.downloadReceipt(paymentId)
  }
  
  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Cargando información de suscripción...</p>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se pudo cargar la información de suscripción</p>
        </CardContent>
      </Card>
    )
  }

  const { plan, activeFeatures, pricingBreakdown, costSummary, subscriptionStatus } = subscriptionData

  return (
    <div className="space-y-6">
      {/* Plan Actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Plan Actual
              </CardTitle>
              <CardDescription>
                Tu suscripción y próximo cobro
              </CardDescription>
            </div>
            <Badge 
              variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}
              className="h-6"
            >
              {subscriptionStatus === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan && (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    Facturación {plan.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${costSummary.nextBillingAmount}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.billingPeriod === 'monthly' ? '/mes' : '/año'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Próximo cobro: {new Date(costSummary.nextBillingDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Desglose de Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Desglose de Costos
          </CardTitle>
          <CardDescription>
            {activeFeatures.length} funcionalidades activas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de features con precios */}
          <div className="space-y-3">
            {pricingBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{item.featureName}</span>
                </div>
                <span className="font-semibold">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Resumen de costos */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan Base</span>
              <span>${costSummary.breakdown.planBase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Features</span>
              <span>${costSummary.breakdown.features.toFixed(2)}</span>
            </div>
            {costSummary.breakdown.taxes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impuestos (13%)</span>
                <span>${costSummary.breakdown.taxes.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Mensual</span>
              <span>${costSummary.breakdown.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Funcionalidades Activas
          </CardTitle>
          <CardDescription>
            Todas las características incluidas en tu plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(subscriptionData.featuresByCategory).map(([category, features]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  {category}
                </h4>
                <div className="space-y-1">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2 py-1">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historial de Facturación */}
      <BillingHistory 
        records={paymentRecords} 
        onDownload={handleDownloadReceipt}
      />

      {/* Acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onUpdatePaymentMethod}
              disabled={!onUpdatePaymentMethod}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Actualizar Método de Pago
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setShowManager(s => !s)}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Cambiar Plan
            </Button>
          </div>
        </CardContent>
      </Card>
      {showManager && (
        <div className="pt-4">
          <SubscriptionManager
            subscriptionData={subscriptionData}
            brandId={brandId}
            onChangePlan={async (planId) => {
              // Pasar al handler superior si existe
              if (onUpgradePlan) await onUpgradePlan()
            }}
            onPlanChanged={() => {
              // Recargar datos después del cambio
              if (brandId) {
                loadPayments()
              }
              setShowManager(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
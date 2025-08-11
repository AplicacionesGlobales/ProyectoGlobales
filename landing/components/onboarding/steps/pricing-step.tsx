"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react"
import { APP_FEATURES } from "@/lib/business-types"

const plans = [
  {
    id: "web",
    name: "Solo Web",
    description: "Perfecto para empezar online",
    basePrice: 0,
    discount: 0,
    period: "mes",
    yearlyPrice: 0,
    features: [
      "Sitio web responsive",
      "Gestión básica de citas",
      "Dominio personalizado",
      "3.8% + $0.40 por transacción",
      "Soporte por email"
    ],
    popular: false,
    badge: "Sin Mensualidad",
    badgeColor: "bg-green-100 text-green-800"
  },
  {
    id: "app",
    name: "Solo App Móvil",
    description: "La experiencia móvil completa",
    basePrice: 59,
    discount: 0,
    period: "mes",
    yearlyPrice: 590, // 59 * 10 months (2 months free)
    monthlyEquivalent: 49,
    features: [
      "App en App Store y Google Play",
      "Notificaciones push",
      "Funciones avanzadas de citas",
      "3.8% + $0.40 por transacción",
      "Soporte prioritario"
    ],
    popular: true,
    badge: "Más Popular",
    badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
  },
  {
    id: "complete",
    name: "Web + App Completa",
    description: "La solución completa para tu negocio",
    basePrice: 60,
    discount: 0,
    period: "mes",
    yearlyPrice: 600, // 60 * 10 months (2 months free)
    monthlyEquivalent: 50,
    features: [
      "Todo lo anterior incluido",
      "Sincronización total",
      "Analytics avanzados",
      "3.8% + $0.40 por transacción",
      "Soporte 24/7"
    ],
    popular: false
  }
]

interface PricingStepProps {
  plan: {
    type: "web" | "app" | "complete"
    features: string[]
    price: number
    billingPeriod?: "monthly" | "annual"
  }
  selectedFeatures: string[]
  onChange: (plan: any) => void
  onNext: () => void
  onPrev: () => void
}

export function PricingStep({ plan, selectedFeatures, onChange, onNext, onPrev }: PricingStepProps) {
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "annual">(plan.billingPeriod || "monthly")
  const selectedPlan = plans.find(p => p.id === plan.type)
  
  // Calculate features price using the APP_FEATURES data
  const featuresPrice = selectedFeatures.reduce((total, featureId) => {
    const feature = APP_FEATURES.find(f => f.id === featureId);
    return total + (feature?.price || 0);
  }, 0)

  const calculateFinalPrice = (planOption: any, billing: "monthly" | "annual") => {
    const basePrice = planOption.basePrice || 0
    const totalMonthlyPrice = basePrice + featuresPrice
    
    if (billing === "annual") {
      // For annual: apply 20% discount
      return (totalMonthlyPrice * 12 * 0.8)
    }
    return totalMonthlyPrice
  }

  const finalPrice = selectedPlan ? calculateFinalPrice(selectedPlan, billingPeriod) : 0

  const handlePlanChange = (planType: "web" | "app" | "complete") => {
    const selectedPlanOption = plans.find(p => p.id === planType)
    if (selectedPlanOption) {
      const newFinalPrice = calculateFinalPrice(selectedPlanOption, billingPeriod)
      
      onChange({
        type: planType,
        features: selectedPlanOption.features,
        price: newFinalPrice,
        billingPeriod: billingPeriod
      })
    }
  }

  const handleBillingPeriodChange = (newBillingPeriod: "monthly" | "annual") => {
    setBillingPeriod(newBillingPeriod)
    if (selectedPlan) {
      const newFinalPrice = calculateFinalPrice(selectedPlan, newBillingPeriod)
      onChange({
        type: plan.type,
        features: selectedPlan.features,
        price: newFinalPrice,
        billingPeriod: newBillingPeriod
      })
    }
  }

  // Update price when features change
  React.useEffect(() => {
    if (selectedPlan) {
      onChange({
        type: plan.type,
        features: selectedPlan.features,
        price: finalPrice,
        billingPeriod: billingPeriod
      })
    }
  }, [selectedFeatures])

  const isValid = plan.type && ["web", "app", "complete"].includes(plan.type)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
        <p className="mt-2 text-gray-600">
          Selecciona el tipo de aplicación que mejor se adapte a tus necesidades
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleBillingPeriodChange("monthly")}
          >
            Mensual
          </Button>
          <Button
            variant={billingPeriod === "annual" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleBillingPeriodChange("annual")}
            className="ml-1"
          >
            Anual (-20%)
          </Button>
        </div>
      </div>

      <RadioGroup
        value={plan.type}
        onValueChange={(value) => handlePlanChange(value as "web" | "app" | "complete")}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((planOption) => (
            <div key={planOption.id} className="relative">
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  plan.type === planOption.id
                    ? "ring-2 ring-purple-500 bg-purple-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handlePlanChange(planOption.id as "web" | "app" | "complete")}
              >
                {planOption.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={planOption.badgeColor}>
                      <Star className="w-3 h-3 mr-1" />
                      {planOption.badge}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value={planOption.id} id={planOption.id} />
                  <Label htmlFor={planOption.id} className="text-lg font-semibold cursor-pointer">
                    {planOption.name}
                  </Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">{planOption.description}</p>
                    <div className="mt-2">
                      {billingPeriod === "annual" && planOption.yearlyPrice !== undefined ? (
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            ${planOption.yearlyPrice}
                          </span>
                          <span className="text-gray-600">/año</span>
                          {planOption.monthlyEquivalent && (
                            <div className="text-sm text-gray-500 mt-1">
                              (${planOption.monthlyEquivalent}/mes)
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            ${planOption.basePrice}
                          </span>
                          <span className="text-gray-600">/{planOption.period}</span>
                        </div>
                      )}
                      {planOption.discount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          -{planOption.discount}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {planOption.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Price Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Resumen de costos</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Plan base:</span>
            <span>
              {billingPeriod === "annual" && selectedPlan?.yearlyPrice !== undefined
                ? `$${selectedPlan.yearlyPrice}/${billingPeriod === "annual" ? "año" : selectedPlan.period}`
                : `$${selectedPlan?.basePrice || 0}/${selectedPlan?.period || "mes"}`
              }
            </span>
          </div>
          {featuresPrice > 0 && (
            <div className="flex justify-between">
              <span>Funciones adicionales:</span>
              <span>
                ${billingPeriod === "annual" ? featuresPrice * 12 : featuresPrice}
                {billingPeriod === "annual" ? "/año" : "/mes"}
              </span>
            </div>
          )}
          {billingPeriod === "annual" && featuresPrice > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento anual (20%) en funciones:</span>
              <span>-${(featuresPrice * 12 * 0.2).toFixed(2)}</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>
              ${finalPrice.toFixed(2)}
              /{billingPeriod === "annual" ? "año" : "mes"}
            </span>
          </div>
          {billingPeriod === "annual" && (
            <p className="text-sm text-gray-600 text-center mt-2">
              ¡Pagas todo el año de una vez!
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="flex items-center gap-2">
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

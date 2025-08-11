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
    id: "monthly",
    name: "Plan Mensual",
    description: "Ideal para empezar",
    basePrice: 49,
    discount: 0,
    period: "mes",
    yearlyPrice: null,
    features: [
      "Hasta 100 citas por mes",
      "1 usuario administrador",
      "Soporte por email",
      "Almacenamiento básico (1GB)"
    ],
    popular: false
  },
  {
    id: "annual",
    name: "Plan Anual",
    description: "Ahorra 20% pagando anual",
    basePrice: 39,
    discount: 20,
    period: "año",
    yearlyPrice: 468, // 39 * 12 = 468
    monthlyEquivalent: 39,
    features: [
      "Citas ilimitadas",
      "Hasta 3 usuarios",
      "Soporte prioritario",
      "Almacenamiento extendido (5GB)",
      "Reportes avanzados",
      "Backup automático"
    ],
    popular: true
  }
]

interface PricingStepProps {
  plan: {
    type: "monthly" | "annual"
    features: string[]
    price: number
  }
  selectedFeatures: string[]
  onChange: (plan: any) => void
  onNext: () => void
  onPrev: () => void
}

export function PricingStep({ plan, selectedFeatures, onChange, onNext, onPrev }: PricingStepProps) {
  const selectedPlan = plans.find(p => p.id === plan.type)
  
  // Calculate features price using the APP_FEATURES data
  const featuresPrice = selectedFeatures.reduce((total, featureId) => {
    const feature = APP_FEATURES.find(f => f.id === featureId);
    return total + (feature?.price || 0);
  }, 0)

  const totalPrice = (selectedPlan?.basePrice || 0) + featuresPrice
  const finalPrice = plan.type === "annual" ? (totalPrice * 12 * 0.8) : totalPrice

  const handlePlanChange = (planType: "monthly" | "annual") => {
    const selectedPlanOption = plans.find(p => p.id === planType)
    if (selectedPlanOption) {
      const newTotalPrice = selectedPlanOption.basePrice + featuresPrice
      const newFinalPrice = planType === "annual" ? (newTotalPrice * 12 * 0.8) : newTotalPrice
      
      onChange({
        type: planType,
        features: selectedPlanOption.features,
        price: newFinalPrice
      })
    }
  }

  // Update price when features change
  React.useEffect(() => {
    if (selectedPlan) {
      onChange({
        type: plan.type,
        features: selectedPlan.features,
        price: finalPrice
      })
    }
  }, [selectedFeatures, plan.type])

  const isValid = plan.type && (plan.type === "monthly" || plan.type === "annual")

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
        <p className="mt-2 text-gray-600">
          Selecciona el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <RadioGroup
        value={plan.type}
        onValueChange={(value) => handlePlanChange(value as "monthly" | "annual")}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((planOption) => (
            <div key={planOption.id} className="relative">
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  plan.type === planOption.id
                    ? "ring-2 ring-purple-500 bg-purple-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handlePlanChange(planOption.id as "monthly" | "annual")}
              >
                {planOption.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Más Popular
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
                      {planOption.id === "annual" ? (
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            ${planOption.yearlyPrice}
                          </span>
                          <span className="text-gray-600">/{planOption.period}</span>
                          <div className="text-sm text-gray-500 mt-1">
                            (${planOption.monthlyEquivalent}/mes)
                          </div>
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
              {selectedPlan?.id === "annual" 
                ? `$${selectedPlan.yearlyPrice}/${selectedPlan.period}`
                : `$${selectedPlan?.basePrice || 0}/${selectedPlan?.period}`
              }
            </span>
          </div>
          {featuresPrice > 0 && (
            <div className="flex justify-between">
              <span>Funciones adicionales:</span>
              <span>
                ${plan.type === "annual" ? featuresPrice * 12 : featuresPrice}
                {plan.type === "annual" ? "/año" : "/mes"}
              </span>
            </div>
          )}
          {plan.type === "annual" && featuresPrice > 0 && (
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
              /{plan.type === "annual" ? "año" : "mes"}
            </span>
          </div>
          {plan.type === "annual" && (
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

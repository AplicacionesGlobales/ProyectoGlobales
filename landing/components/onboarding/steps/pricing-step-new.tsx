"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, Star, Loader2 } from "lucide-react"
import { useLandingData } from "@/hooks/use-landing-data"
import { type Feature } from "@/lib/api"

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
  const { plans, features, loading, error } = useLandingData()
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "annual">(plan.billingPeriod || "monthly")
  
  // Transform backend plan type to match component expectations
  const selectedPlan = plans.find(p => {
    if (plan.type === "complete") return p.type === "complete"
    if (plan.type === "app") return p.type === "app" 
    if (plan.type === "web") return p.type === "web"
    return false
  })
  
  // Calculate features price using the backend features data
  const featuresPrice = selectedFeatures.reduce((total, featureKey) => {
    const feature = features.find(f => f.key === featureKey);
    return total + (feature?.price || 0);
  }, 0)

  const calculateFinalPrice = (planOption: any, billing: "monthly" | "annual") => {
    const basePrice = planOption?.basePrice || 0
    const totalMonthlyPrice = basePrice + featuresPrice
    
    if (billing === "annual") {
      // For annual: apply 20% discount
      return (totalMonthlyPrice * 12 * 0.8)
    }
    return totalMonthlyPrice
  }

  const finalPrice = selectedPlan ? calculateFinalPrice(selectedPlan, billingPeriod) : 0

  const handlePlanChange = (planType: "web" | "app" | "complete") => {
    const selectedPlanOption = plans.find(p => {
      if (planType === "complete") return p.type === "complete"
      if (planType === "app") return p.type === "app" 
      if (planType === "web") return p.type === "web"
      return false
    })
    
    if (selectedPlanOption) {
      const newFinalPrice = calculateFinalPrice(selectedPlanOption, billingPeriod)
      
      onChange({
        type: planType,
        features: [], // Will be populated from backend data
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
        features: [],
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
        features: [],
        price: finalPrice,
        billingPeriod: billingPeriod
      })
    }
  }, [selectedFeatures])

  const isValid = plan.type && ["web", "app", "complete"].includes(plan.type)

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
          <p className="mt-2 text-gray-600">
            Cargando planes disponibles...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
          <p className="mt-2 text-red-600">
            Error al cargar los planes: {error}
          </p>
        </div>
        <div className="flex justify-between">
          <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>
          <Button onClick={onNext} disabled className="flex items-center gap-2">
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Transform plans for display (similar to the original structure)
  const plansForDisplay = plans.map(p => ({
    id: p.type,
    name: p.name,
    description: p.description || "",
    basePrice: p.basePrice,
    discount: 0,
    period: "mes",
    yearlyPrice: p.basePrice * 12 * 0.8, // 20% discount for annual
    monthlyEquivalent: Math.round(p.basePrice * 0.8),
    features: getFeaturesByPlan(p.type),
    popular: p.type === "app", // App plan is most popular
    badge: p.type === "app" ? "Más Popular" : p.type === "web" ? "Sin Mensualidad" : "Completo",
    badgeColor: p.type === "app" 
      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      : p.type === "web" 
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800"
  }))

  function getFeaturesByPlan(planType: string): string[] {
    // Return basic features for each plan type
    switch (planType) {
      case "web":
        return [
          "Sitio web responsive",
          "Gestión básica de citas",
          "Dominio personalizado",
          "3.8% + $0.40 por transacción",
          "Soporte por email"
        ]
      case "app":
        return [
          "App en App Store y Google Play",
          "Notificaciones push",
          "Funciones avanzadas de citas",
          "3.8% + $0.40 por transacción",
          "Soporte prioritario"
        ]
      case "complete":
        return [
          "Todo lo anterior incluido",
          "Sincronización total",
          "Analytics avanzados",
          "3.8% + $0.40 por transacción",
          "Soporte 24/7"
        ]
      default:
        return []
    }
  }

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
          {plansForDisplay.map((planOption) => (
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
                            ${planOption.yearlyPrice.toFixed(0)}
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
              {billingPeriod === "annual" && selectedPlan
                ? `$${(selectedPlan.basePrice * 12 * 0.8).toFixed(2)}/año`
                : `$${selectedPlan?.basePrice || 0}/mes`
              }
            </span>
          </div>
          {featuresPrice > 0 && (
            <div className="flex justify-between">
              <span>Funciones adicionales:</span>
              <span>
                ${billingPeriod === "annual" ? (featuresPrice * 12 * 0.8).toFixed(2) : featuresPrice.toFixed(2)}
                {billingPeriod === "annual" ? "/año" : "/mes"}
              </span>
            </div>
          )}
          {billingPeriod === "annual" && featuresPrice > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento anual (20%):</span>
              <span>-${((featuresPrice * 12 * 0.2)).toFixed(2)}</span>
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

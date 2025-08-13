"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useLandingData } from "@/hooks/use-landing-data"
import { Icon } from "@/lib/icons"

interface BusinessInfoStepProps {
  businessType: string
  onChange: (businessType: string) => void
  onNext: () => void
  onPrev: () => void
}

export function BusinessInfoStep({ businessType, onChange, onNext, onPrev }: BusinessInfoStepProps) {
  const { 
    businessTypes, 
    loading, 
    error, 
    getRecommendedFeatures 
  } = useLandingData();

  const isValid = businessType !== ""

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-600">Cargando tipos de negocio...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  // Handle empty businessTypes (additional safety check)
  if (!businessTypes || businessTypes.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tipos de negocio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">¿Qué tipo de servicio ofreces?</h2>
        <p className="mt-2 text-gray-600">
          Selecciona el tipo de negocio que mejor describa tu servicio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(businessTypes) && businessTypes.map((type) => {
          const recommendedFeatures = getRecommendedFeatures(type.key)
          
          return (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                businessType === type.key
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onChange(type.key)}
            >
              <div className="text-center space-y-2">
                <Icon name={type.icon} size={32} className="text-blue-600" />
                <h3 className="font-medium text-gray-900">{type.title}</h3>
                {type.subtitle && (
                  <p className="text-sm text-gray-500">{type.subtitle}</p>
                )}
                <div className="flex flex-wrap gap-1 justify-center">
                  {recommendedFeatures.slice(0, 3).map((feature) => (
                    <Badge key={feature.id} variant="secondary" className="text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {feature.title}
                    </Badge>
                  ))}
                  {recommendedFeatures.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{recommendedFeatures.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
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

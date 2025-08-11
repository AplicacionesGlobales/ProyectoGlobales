"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BUSINESS_TYPES, getRecommendedFeatures } from "@/lib/business-types"
import { Icon } from "@/lib/icons"

interface BusinessInfoStepProps {
  businessType: string
  onChange: (businessType: string) => void
  onNext: () => void
  onPrev: () => void
}

export function BusinessInfoStep({ businessType, onChange, onNext, onPrev }: BusinessInfoStepProps) {
  const isValid = businessType !== ""

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">¿Qué tipo de servicio ofreces?</h2>
        <p className="mt-2 text-gray-600">
          Selecciona el tipo de negocio que mejor describa tu servicio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESS_TYPES.map((type) => {
          const recommendedFeatures = getRecommendedFeatures(type.id)
          
          return (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                businessType === type.id
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onChange(type.id)}
            >
              <div className="text-center space-y-2">
                <Icon name={type.icon} size={32} className="text-blue-600" />
                <h3 className="font-medium text-gray-900">{type.name}</h3>
                <div className="flex flex-wrap gap-1 justify-center">
                  {recommendedFeatures.slice(0, 3).map((feature) => (
                    <Badge key={feature.id} variant="secondary" className="text-xs">
                      {feature.icon} {feature.name}
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

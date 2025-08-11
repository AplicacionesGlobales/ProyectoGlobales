"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { APP_FEATURES, getRecommendedFeatures, getBusinessType, AppFeature } from "@/lib/business-types"
import { Icon } from "@/lib/icons"

interface FeaturesStepProps {
  features: string[]
  businessType: string
  onChange: (features: string[]) => void
  onNext: () => void
  onPrev: () => void
}

export function FeaturesStep({ features, businessType, onChange, onNext, onPrev }: FeaturesStepProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(features || [])
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false)

  // Get recommended features based on business type
  const recommendedFeatures = getRecommendedFeatures(businessType)
  const recommendedIds = recommendedFeatures.map(f => f.id)
  const businessTypeInfo = getBusinessType(businessType)

  // Pre-select recommended features when business type changes
  useEffect(() => {
    if (businessType && recommendedIds.length > 0) {
      // Merge existing selections with recommended features
      const newFeatures = Array.from(new Set([...selectedFeatures, ...recommendedIds]))
      setSelectedFeatures(newFeatures)
      onChange(newFeatures)
    }
  }, [businessType]) // Only depend on businessType

  const handleFeatureToggle = (featureId: string) => {
    const newFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId]
    
    setSelectedFeatures(newFeatures)
    onChange(newFeatures)
  }

  // Group features by category
  const coreFeatures = APP_FEATURES.filter(f => f.category === 'core')
  const businessFeatures = APP_FEATURES.filter(f => f.category === 'business')
  const advancedFeatures = APP_FEATURES.filter(f => f.category === 'advanced')

  const displayFeatures = showRecommendedOnly 
    ? APP_FEATURES.filter(f => recommendedIds.includes(f.id))
    : APP_FEATURES

  const isValid = selectedFeatures.length > 0

  const renderFeatureCard = (feature: AppFeature) => {
    const isSelected = selectedFeatures.includes(feature.id)
    const isRecommended = recommendedIds.includes(feature.id)
    
    return (
      <Card key={feature.id} className={`p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:shadow-md'
      } ${isRecommended ? 'border-green-200 bg-green-50' : ''}`}
      onClick={() => handleFeatureToggle(feature.id)}
      >
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isSelected}
            onChange={() => handleFeatureToggle(feature.id)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="font-semibold">{feature.name}</h3>
              {isRecommended && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Recomendado
                </Badge>
              )}
              {feature.popular && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        </div>
      </Card>
    )
  }
    price: 15,
  },
]

interface FeaturesStepProps {
  selectedFeatures: string[]
  onChange: (features: string[]) => void
  onNext: () => void
  onPrev: () => void
}

export function FeaturesStep({ selectedFeatures, onChange, onNext, onPrev }: FeaturesStepProps) {
  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      onChange(selectedFeatures.filter(id => id !== featureId))
    } else {
      onChange([...selectedFeatures, featureId])
    }
  }

  const totalCost = selectedFeatures.reduce((total, featureId) => {
    const feature = services.find(s => s.id === featureId)
    return total + (feature?.price || 0)
  }, 0)

  const isValid = selectedFeatures.length > 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">¿Qué funciones necesitas?</h2>
        <p className="mt-2 text-gray-600">
          Selecciona las funciones que quieres incluir en tu aplicación
        </p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-4 transition-all hover:shadow-md cursor-pointer ${
              selectedFeatures.includes(service.id)
                ? "ring-2 ring-purple-500 bg-purple-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => toggleFeature(service.id)}
          >
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={selectedFeatures.includes(service.id)}
                onChange={() => toggleFeature(service.id)}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Icon name={service.icon} size={24} className="text-blue-600" />
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <Badge variant="outline">${service.price}/mes</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedFeatures.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Costo mensual estimado:</span>
            <span className="text-xl font-bold text-purple-600">${totalCost}/mes</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Funciones seleccionadas: {selectedFeatures.length}
          </p>
        </div>
      )}

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

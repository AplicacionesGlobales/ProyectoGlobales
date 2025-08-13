"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Lightbulb, Filter, Loader2, Sparkles } from "lucide-react"
import { useLandingData } from "@/hooks/use-landing-data"
import { Feature } from "@/lib/api/types"

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

  const { 
    features: allFeatures, 
    loading, 
    error, 
    getRecommendedFeatures,
    getFeaturesByCategory,
    getBusinessTypeByKey 
  } = useLandingData();

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-600">Cargando funcionalidades...</span>
      </div>
    );
  }

  // Error state
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

  // Get recommended features based on business type
  const recommendedFeatures = getRecommendedFeatures(businessType)
  const recommendedIds = recommendedFeatures.map(f => f.key) // Changed from f.id to f.key
  const businessTypeInfo = getBusinessTypeByKey(businessType)

  // Pre-select recommended features when business type changes
  useEffect(() => {
    if (businessType && recommendedIds.length > 0 && selectedFeatures.length === 0) {
      // Only auto-select if no features are currently selected
      setSelectedFeatures(recommendedIds)
      onChange(recommendedIds)
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
  const coreFeatures = getFeaturesByCategory('ESSENTIAL')
  const businessFeatures = getFeaturesByCategory('BUSINESS')
  const advancedFeatures = getFeaturesByCategory('ADVANCED')

  const displayFeatures = showRecommendedOnly 
    ? allFeatures.filter(f => recommendedIds.includes(f.key))
    : allFeatures

  const isValid = selectedFeatures.length > 0

  const renderFeatureCard = (feature: Feature) => {
    const isSelected = selectedFeatures.includes(feature.key)
    const isRecommended = recommendedIds.includes(feature.key)
    
    return (
      <Card 
        key={feature.id} 
        className={`p-4 cursor-pointer transition-all ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50' 
            : 'hover:shadow-md'
        } ${isRecommended ? 'border-green-200 bg-green-50' : ''}`}
        onClick={() => handleFeatureToggle(feature.key)}
      >
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isSelected}
            onChange={() => handleFeatureToggle(feature.key)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3" />
              <h3 className="font-semibold">{feature.title}</h3>
              {isRecommended && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              )}
              {feature.isPopular && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-purple-600">${feature.price}/mes</span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const renderCategorySection = (title: string, features: Feature[]) => {
    if (showRecommendedOnly) return null
    
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <div className="grid gap-3">
          {features.map(renderFeatureCard)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">¿Qué funciones necesitas?</h2>
        <p className="mt-2 text-gray-600">
          Selecciona las funciones que quieres incluir en tu aplicación
        </p>
        {businessTypeInfo && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Para <strong>{businessTypeInfo.title}</strong> recomendamos estas funciones que ya están seleccionadas
            </p>
          </div>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {showRecommendedOnly ? 'Ver todas' : 'Solo recomendadas'}
        </Button>
      </div>

      {/* Features display */}
      <div className="space-y-6">
        {showRecommendedOnly ? (
          <div className="grid gap-3">
            {displayFeatures.map(renderFeatureCard)}
          </div>
        ) : (
          <>
            {renderCategorySection("Funciones Esenciales", coreFeatures)}
            {renderCategorySection("Funciones de Negocio", businessFeatures)}
            {renderCategorySection("Funciones Avanzadas", advancedFeatures)}
          </>
        )}
      </div>

      {/* Selection summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Has seleccionado <strong>{selectedFeatures.length}</strong> funciones
          {recommendedIds.length > 0 && (
            <span className="text-green-600 ml-2">
              (incluye {selectedFeatures.filter(id => recommendedIds.includes(id)).length} recomendadas)
            </span>
          )}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="gap-2"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

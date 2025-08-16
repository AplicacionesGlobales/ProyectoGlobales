"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Lightbulb, Filter, Loader2 } from "lucide-react"
import { useLandingData } from "@/hooks/use-landing-data"
import { Feature } from "@/app/api/types"

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

  // Get recommended features based on business type (always called)
  const recommendedFeatures = getRecommendedFeatures(businessType)
  const recommendedKeys = recommendedFeatures.map(f => f.key)
  const businessTypeInfo = getBusinessTypeByKey(businessType)

  // Pre-select recommended features when business type changes
  useEffect(() => {
    if (businessType && recommendedKeys.length > 0 && selectedFeatures.length === 0) {
      const initialSelection = recommendedKeys.filter(key => 
        recommendedFeatures.find(f => f.key === key)?.isRecommended
      );
      setSelectedFeatures(initialSelection);
      onChange(initialSelection);
    }
  }, [businessType, recommendedKeys.length, selectedFeatures.length, onChange]);

  // Organize features by category (always called)
  const essentialFeatures = getFeaturesByCategory('ESSENTIAL')
  const businessFeatures = getFeaturesByCategory('BUSINESS')  
  const advancedFeatures = getFeaturesByCategory('ADVANCED')

  // Filter features to show (always called)
  const featuresToShow = showRecommendedOnly
    ? allFeatures.filter(f => recommendedKeys.includes(f.key))
    : allFeatures

  const handleFeatureToggle = (featureKey: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedFeatures, featureKey]
      : selectedFeatures.filter(f => f !== featureKey)
    
    setSelectedFeatures(newSelection)
    onChange(newSelection)
  }

  const renderFeatureCard = (feature: Feature) => {
    const isSelected = selectedFeatures.includes(feature.key)
    const isRecommended = recommendedKeys.includes(feature.key)
    
    return (
      <Card key={feature.key} className={`p-4 cursor-pointer transition-all ${
        isSelected ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-300'
      }`}>
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              {isRecommended && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              )}
              {feature.isPopular && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-purple-600">
                +${feature.price}/mes
              </span>
              {feature.subtitle && (
                <span className="text-xs text-gray-500">{feature.subtitle}</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const renderCategorySection = (title: string, features: Feature[]) => {
    if (features.length === 0) return null;
    
    return (
      <div key={title} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{title}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map(renderFeatureCard)}
        </div>
      </div>
    )
  }

  const calculateTotalPrice = () => {
    return selectedFeatures.reduce((total, featureKey) => {
      const feature = allFeatures.find(f => f.key === featureKey);
      return total + (feature?.price || 0);
    }, 0)
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-600">Cargando funcionalidades...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg mb-4">Error al cargar las funcionalidades.</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Personaliza tu App</h2>
        <p className="text-lg text-gray-600">
          {businessTypeInfo ? 
            `Funcionalidades perfectas para ${businessTypeInfo.title.toLowerCase()}` :
            'Selecciona las funcionalidades que necesitas'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant={showRecommendedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showRecommendedOnly ? 'Ver Todas' : 'Solo Recomendadas'}
          </Button>
          {recommendedKeys.length > 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {recommendedKeys.length} recomendadas para tu negocio
            </Badge>
          )}
        </div>
      </div>

      {/* Features by Category */}
      <div className="space-y-8">
        {!showRecommendedOnly ? (
          <>
            {renderCategorySection('Funcionalidades Esenciales', essentialFeatures)}
            {renderCategorySection('Funcionalidades de Negocio', businessFeatures)}
            {renderCategorySection('Funcionalidades Avanzadas', advancedFeatures)}
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Recomendadas para {businessTypeInfo?.title}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {featuresToShow.map(renderFeatureCard)}
            </div>
          </div>
        )}
      </div>

      {/* Selected Features Summary */}
      {selectedFeatures.length > 0 && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold mb-4 text-purple-800">
            Funcionalidades Seleccionadas ({selectedFeatures.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2 mb-4">
            {selectedFeatures.map((featureKey) => {
              const feature = allFeatures.find(f => f.key === featureKey);
              if (!feature) return null;
              
              return (
                <div key={featureKey} className="flex items-center justify-between">
                  <span className="text-sm">{feature.title}</span>
                  <span className="text-sm font-medium text-purple-600">
                    +${feature.price}/mes
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold">Total funcionalidades:</span>
            <span className="text-lg font-bold text-purple-600">
              +${calculateTotalPrice()}/mes
            </span>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

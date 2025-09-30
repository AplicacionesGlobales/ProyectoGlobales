"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { Feature } from "@/api/types"
import { useBrandFeatures } from "@/hooks/use-brand-features"
import { FeaturesHeader } from "./FeaturesHeader"
import { FeaturesStats } from "./FeaturesStats"
import { FeaturesSearch } from "./FeaturesSearch"
import { FeaturesTableList } from "./FeaturesTableList"
import { FeatureDetailsDialog } from "./FeatureDetailsDialog"
import { FeatureConfirmDialog } from "./FeatureConfirmDialog"

interface FeaturesTableProps {
  brandId: number
}

export function FeaturesTable({ brandId }: FeaturesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [featureToToggle, setFeatureToToggle] = useState<{
    feature: Feature;
    isCurrentlyActive: boolean;
  } | null>(null)

  const {
    allFeatures,
    brandFeatures,
    loading,
    error,
    activeBrandFeatures,
    toggleFeature,
    refresh
  } = useBrandFeatures({ brandId, autoLoad: true })

  // Filter features based on search term
  const filteredFeatures = allFeatures.filter((feature: Feature) =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if a feature is currently assigned and active
  const isFeatureActive = (featureId: number): boolean => {
    const brandFeature = brandFeatures.find((bf) => bf.featureId === featureId)
    return brandFeature?.isActive ?? false
  }

  // Handle feature toggle
  const handleFeatureToggle = async (feature: Feature) => {
    const isCurrentlyActive = isFeatureActive(feature.id)
    
    setFeatureToToggle({ feature, isCurrentlyActive })
    setIsConfirmDialogOpen(true)
  }

  // Confirm feature toggle
  const confirmFeatureToggle = async () => {
    if (!featureToToggle) return

    const { feature, isCurrentlyActive } = featureToToggle
    const success = await toggleFeature(brandId, feature.id, isCurrentlyActive)
    
    if (success) {
      await refresh()
    }
    
    setIsConfirmDialogOpen(false)
    setFeatureToToggle(null)
  }

  // Show feature details
  const showFeatureDetails = (feature: Feature) => {
    setSelectedFeature(feature)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FeaturesHeader onRefresh={refresh} loading={loading} />

      {/* Stats Cards */}
      <FeaturesStats 
        totalFeatures={allFeatures.length}
        activeFeaturesCount={activeBrandFeatures.length}
        activeBrandFeatures={activeBrandFeatures}
      />

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Funcionalidades Disponibles
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <FeaturesSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>

          {/* Features Table */}
          <FeaturesTableList
            features={filteredFeatures}
            brandFeatures={brandFeatures}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            onFeatureToggle={handleFeatureToggle}
            onShowDetails={showFeatureDetails}
          />
        </CardContent>
      </Card>

      {/* Feature Details Dialog */}
      <FeatureDetailsDialog
        feature={selectedFeature}
        isOpen={isDetailDialogOpen}
        isActive={selectedFeature ? isFeatureActive(selectedFeature.id) : false}
        onClose={() => setIsDetailDialogOpen(false)}
      />

      {/* Confirmation Dialog */}
      <FeatureConfirmDialog
        feature={featureToToggle?.feature ?? null}
        isCurrentlyActive={featureToToggle?.isCurrentlyActive ?? false}
        isOpen={isConfirmDialogOpen}
        loading={loading}
        onConfirm={confirmFeatureToggle}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  )
}